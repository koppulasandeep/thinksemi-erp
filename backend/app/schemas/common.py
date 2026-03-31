"""Common / shared Pydantic v2 schemas."""

from pydantic import BaseModel


class StatusUpdate(BaseModel):
    status: str


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
