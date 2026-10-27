"""Redis CAS state machine: one owner per revision and exact response replay."""
import hashlib
import json
import uuid

from .errors import WorkflowError
from .context import CURRENT_CONTEXT

CLAIM_LUA = """
local raw = redis.call('GET', KEYS[1])
if not raw then return cjson.encode({kind='expired'}) end
local s = cjson.decode(raw)
local rev = ARGV[1]
local claim = s.claims[rev]
if claim then
  if claim.hash ~= ARGV[2] then return cjson.encode({kind='conflict'}) end
  if claim.result then return cjson.encode({kind='cached', result=claim.result}) end
  return cjson.encode({kind='inflight'})
end
if s.closed or tonumber(rev) ~= s.revision then return cjson.encode({kind='conflict'}) end
s.claims[rev] = {hash=ARGV[2], token=ARGV[3]}
local ttl = redis.call('PTTL', KEYS[1])
if ttl <= 0 then return cjson.encode({kind='expired'}) end
redis.call('SET', KEYS[1], cjson.encode(s), 'PX', ttl)
return cjson.encode({kind='claimed', state=s.state})
"""

COMPLETE_LUA = """
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local s = cjson.decode(raw)
local claim = s.claims[ARGV[1]]
if not claim or claim.token ~= ARGV[2] or claim.result or s.closed or
   s.revision ~= tonumber(ARGV[1]) then return 0 end
claim.result = ARGV[3]
if ARGV[4] ~= 'null' then
  s.state = ARGV[4]
  s.revision = s.revision + 1
else
  s.closed = true
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl <= 0 then return 0 end
redis.call('SET', KEYS[1], cjson.encode(s), 'PX', ttl)
return 1
"""

RELEASE_INVALID_INPUT_LUA = """
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local s = cjson.decode(raw)
local claim = s.claims[ARGV[1]]
if not claim or claim.token ~= ARGV[2] or claim.result or
   s.closed or s.revision ~= tonumber(ARGV[1]) then return 0 end
local ttl = redis.call('PTTL', KEYS[1])
if ttl <= 0 then return 0 end
s.claims[ARGV[1]] = nil
redis.call('SET', KEYS[1], cjson.encode(s), 'PX', ttl)
return 1
"""


class RedisClarificationStore:
    def __init__(self, client, prefix="chatboy:clarification:v2.2:"):
        self.client, self.prefix = client, prefix

    def _call(self, function, *args, **kwargs):
        ctx = CURRENT_CONTEXT.get()
        if ctx:
            ctx.remaining()
        try:
            result = function(*args, **kwargs)
        except Exception as exc:
            raise WorkflowError("dependency_unavailable", "Kho lưu lượt làm rõ không khả dụng.", retryable=True) from exc
        if ctx:
            ctx.remaining()
        return result

    def create(self, state):
        identifier = uuid.uuid4().hex
        state = {**state, "revision": 1, "rounds": 0}
        envelope = {"claims": {}, "revision": 1, "state": json.dumps(state, ensure_ascii=False)}
        ok = self._call(self.client.set, self.prefix + identifier, json.dumps(envelope, ensure_ascii=False), nx=True, px=900_000)
        if not ok:
            raise WorkflowError("clarification_conflict", "Không thể tạo lượt làm rõ.")
        return identifier, state

    def claim(self, identifier, revision, answers):
        digest = hashlib.sha256(json.dumps(answers, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        token = uuid.uuid4().hex
        value = json.loads(self._call(self.client.eval, CLAIM_LUA, 1, self.prefix + identifier, str(revision), digest, token))
        kind = value["kind"]
        if kind == "expired":
            raise WorkflowError("clarification_expired", "Lượt làm rõ đã hết hạn; hãy gửi lại câu hỏi.")
        if kind in {"conflict", "inflight"}:
            raise WorkflowError("clarification_conflict", "Revision đã được xử lý hoặc đang được xử lý.", retryable=kind == "inflight")
        return kind, json.loads(value.get("result", value.get("state"))), token

    def complete(self, identifier, revision, token, result, next_state=None):
        ok = self._call(self.client.eval, COMPLETE_LUA, 1, self.prefix + identifier, str(revision), token,
                        json.dumps(result, ensure_ascii=False), json.dumps(next_state, ensure_ascii=False))
        if not ok:
            raise WorkflowError("clarification_expired", "Lượt làm rõ đã hết hạn; hãy gửi lại câu hỏi.")

    def release_invalid_input(self, identifier, revision, token):
        ok = self._call(self.client.eval, RELEASE_INVALID_INPUT_LUA, 1,
                        self.prefix + identifier, str(revision), token)
        if not ok:
            raise WorkflowError('clarification_conflict', 'Lượt làm rõ đã thay đổi hoặc hết hạn.')

    def healthy(self):
        return bool(self._call(self.client.ping))
