import logging

import httpx
from sqlalchemy.orm import Session

from app.models.notification import Notification, PushToken

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_expo_push(tokens: list[str], title: str, body: str, data: dict | None = None) -> None:
    if not tokens:
        return
    messages = [{"to": token, "title": title, "body": body, "data": data or {}} for token in tokens]
    try:
        httpx.post(EXPO_PUSH_URL, json=messages, timeout=10.0)
    except Exception:
        logger.exception("Failed to send Expo push notification")


def notify_user(db: Session, user_id: int, type: str, title: str, body: str, data: dict | None = None) -> Notification:
    notification = Notification(user_id=user_id, type=type, title=title, body=body, data=data)
    db.add(notification)
    db.commit()
    db.refresh(notification)

    tokens = [
        row[0]
        for row in db.query(PushToken.expo_push_token).filter(PushToken.user_id == user_id).all()
    ]
    send_expo_push(tokens, title, body, data)

    return notification
