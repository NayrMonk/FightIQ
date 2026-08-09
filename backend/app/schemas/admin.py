from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
    created_at: datetime
