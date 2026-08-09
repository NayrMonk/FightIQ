from datetime import datetime

from pydantic import BaseModel


class RegisterPushTokenRequest(BaseModel):
    expo_push_token: str


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    body: str
    data: dict | None = None
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
