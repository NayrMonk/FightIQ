from unittest.mock import patch

from tests.conftest import auth_headers, register_user


def test_coach_chat_requires_auth(client):
    res = client.post("/coach/chat", json={"message": "hello"})
    assert res.status_code in (401, 403)


@patch("app.routers.coach.call_groq")
def test_coach_chat_returns_reply_and_includes_history_context(mock_call_groq, client, session_template, today_iso):
    mock_call_groq.return_value = "Focus on your conditioning this week."
    token = register_user(client)
    headers = auth_headers(token)

    res = client.post("/coach/chat", headers=headers, json={"message": "What should I focus on?"})
    assert res.status_code == 200
    assert res.json()["reply"] == "Focus on your conditioning this week."

    # The system prompt sent to Groq should be grounded in the athlete's real context.
    sent_messages = mock_call_groq.call_args[0][0]
    system_message = sent_messages[0]["content"]
    assert "ATHLETE CONTEXT" in system_message
    assert sent_messages[-1]["content"] == "What should I focus on?"


@patch("app.routers.coach.call_groq")
def test_coach_chat_passes_conversation_history(mock_call_groq, client):
    mock_call_groq.return_value = "Got it."
    token = register_user(client)
    headers = auth_headers(token)

    res = client.post(
        "/coach/chat",
        headers=headers,
        json={
            "message": "And what about tomorrow?",
            "history": [
                {"role": "user", "content": "What should I do today?"},
                {"role": "assistant", "content": "Do a conditioning session."},
            ],
        },
    )
    assert res.status_code == 200
    sent_messages = mock_call_groq.call_args[0][0]
    roles = [m["role"] for m in sent_messages]
    assert roles == ["system", "user", "assistant", "user"]


@patch("app.routers.coach.call_groq", side_effect=RuntimeError("GROQ_API_KEY is not configured on the backend"))
def test_coach_chat_returns_503_when_not_configured(mock_call_groq, client):
    token = register_user(client)
    res = client.post("/coach/chat", headers=auth_headers(token), json={"message": "hi"})
    assert res.status_code == 503


@patch("app.routers.coach.call_groq", side_effect=Exception("boom"))
def test_coach_chat_returns_502_on_upstream_failure(mock_call_groq, client):
    token = register_user(client)
    res = client.post("/coach/chat", headers=auth_headers(token), json={"message": "hi"})
    assert res.status_code == 502
