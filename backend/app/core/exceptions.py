"""Domain exceptions with HTTP status code mapping."""

from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    def __init__(self, entity: str, id: str | None = None) -> None:
        detail = f"{entity} not found" if id is None else f"{entity} '{id}' not found"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Not authorized") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ConflictError(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class BadRequestError(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
