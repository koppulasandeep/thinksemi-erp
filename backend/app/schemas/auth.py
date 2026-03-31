"""Auth schemas — login request, token response, user info."""

from pydantic import BaseModel
from uuid import UUID


class UserInfo(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    email: str
    full_name: str | None = None
    role: str
    designation: str | None = None
    tenant_id: UUID


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
