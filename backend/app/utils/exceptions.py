class AppException(Exception):  # noqa: N818
    status_code = 500
    code = "internal_error"
    message = "Something went wrong — please try again."

    def __init__(self, message: str | None = None, original: Exception | None = None):
        super().__init__(message or self.message)
        self.message = message or self.message
        self.original = original


class LLMProviderError(AppException):
    status_code = 502
    code = "llm_provider_error"
    message = (
        "Our assistant is having trouble right now — please try again in a moment."
    )


class DatabaseError(AppException):
    status_code = 503
    code = "database_error"
    message = "A database error occurred — please try again."


class VectorSearchError(AppException):
    status_code = 502
    code = "vector_search_error"
    message = "Search is temporarily unavailable — please try again shortly."


class ValidationError(AppException):
    status_code = 422
    code = "validation_error"
    message = "Invalid request data."
