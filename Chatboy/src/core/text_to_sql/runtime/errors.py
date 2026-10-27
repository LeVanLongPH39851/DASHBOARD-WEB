"""Errors that propagate through semantic fallbacks without being hidden."""


class WorkflowError(Exception):
    def __init__(self, code: str, message: str = "", retryable: bool = False, *, field_errors=None):
        self.code = code
        self.message = message or code
        self.retryable = retryable
        self.field_errors = field_errors or []
        super().__init__(self.message)


ERROR_HTTP = {
    "invalid_input": 422, "resource_exceeded": 422, "invalid_semantics": 422,
    "clarification_expired": 409, "clarification_conflict": 409,
    "clarification_limit": 409, "invalid_result": 502,
    "dependency_unavailable": 503, "busy": 503,
    "deadline_exceeded": 504, "budget_exceeded": 422, "internal_error": 500,
}
