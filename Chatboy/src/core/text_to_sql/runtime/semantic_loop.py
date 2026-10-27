"""One validated repair, shared across router/extractor/pattern decisions."""
from .context import CURRENT_CONTEXT, stage
from .errors import WorkflowError


def validated_call(call, validate, *, stage_name):
    feedback = None
    for attempt in range(2):
        try:
            with stage(stage_name):
                return validate(call(feedback))
        except WorkflowError:
            raise
        except (ValueError, TypeError, KeyError) as exc:
            if attempt:
                raise WorkflowError("invalid_semantics", "Mô hình trả nội dung không hợp lệ; hãy diễn đạt lại câu hỏi.") from exc
            ctx = CURRENT_CONTEXT.get()
            if ctx:
                ctx.repair()
                ctx.emit("semantic_repair", outcome="retry", fallback_reason=type(exc).__name__)
            feedback = str(exc)[:1000]
