from datetime import date, datetime

from pydantic import BaseModel


class FollowResponse(BaseModel):
    follower_id: int
    followee_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    id: int
    display_name: str | None = None

    model_config = {"from_attributes": True}


class ActivityEventResponse(BaseModel):
    id: int
    user: UserSummary
    event_type: str
    payload: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    user: UserSummary
    rank: int
    value: float
    metric: str


class ChallengeCreateRequest(BaseModel):
    title: str
    description: str | None = None
    metric: str
    target_value: int
    start_date: date
    end_date: date


class ChallengeResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    metric: str
    target_value: int
    start_date: date
    end_date: date
    creator: UserSummary
    participant_count: int

    model_config = {"from_attributes": True}


class ChallengeParticipantEntry(BaseModel):
    user: UserSummary
    current_value: float
    completed_at: datetime | None = None


class ChallengeDetailResponse(ChallengeResponse):
    participants: list[ChallengeParticipantEntry] = []
