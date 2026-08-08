from tests.conftest import auth_headers, register_user


def complete_a_session(client, headers, session_template, scheduled_date, rounds=2, intensity=7):
    start_res = client.post(
        "/sessions",
        headers=headers,
        json={"session_template_id": session_template.id, "scheduled_date": scheduled_date},
    )
    session_id = start_res.json()["id"]
    client.post(
        f"/sessions/{session_id}/complete",
        headers=headers,
        json={"rounds_completed": rounds, "total_duration_sec": 480, "perceived_intensity": intensity},
    )
    return session_id


def test_history_empty_for_new_user(client):
    token = register_user(client)
    res = client.get("/history", headers=auth_headers(token))
    assert res.status_code == 200
    assert res.json() == []


def test_history_lists_completed_sessions_only(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    complete_a_session(client, headers, session_template, today_iso)

    res = client.get("/history", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["status"] == "completed"


def test_analytics_summary_reflects_completed_session(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    complete_a_session(client, headers, session_template, today_iso, rounds=2, intensity=8)

    res = client.get("/analytics/summary", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total_sessions_completed"] == 1
    assert body["avg_perceived_intensity"] == 8.0
    assert body["current_streak_days"] == 1
    assert body["round_completion_rate"] == 1.0  # 2 completed / 2 scheduled rounds


def test_analytics_summary_empty_state_for_new_user(client):
    token = register_user(client)
    res = client.get("/analytics/summary", headers=auth_headers(token))
    assert res.status_code == 200
    body = res.json()
    assert body["total_sessions_completed"] == 0
    assert body["avg_perceived_intensity"] is None
    assert body["current_streak_days"] == 0


def test_personal_records_populated_after_completion(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    complete_a_session(client, headers, session_template, today_iso)

    res = client.get("/analytics/personal-records", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_dashboard_shows_no_today_session_when_none_scheduled(client, session_template):
    token = register_user(client)
    res = client.get("/dashboard", headers=auth_headers(token))
    assert res.status_code == 200
    body = res.json()
    assert body["today_session"] is None
    assert body["weekly_sessions_completed"] == 0


def test_dashboard_reflects_todays_completed_session(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    complete_a_session(client, headers, session_template, today_iso, rounds=2, intensity=6)

    res = client.get("/dashboard", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["today_session"]["status"] == "completed"
    assert body["weekly_sessions_completed"] == 1
    assert body["current_streak_days"] == 1
    assert len(body["recent_sessions"]) == 1


def test_dashboard_and_history_are_isolated_per_user(client, session_template, today_iso):
    token_a = register_user(client, "isoa@test.com")
    token_b = register_user(client, "isob@test.com")
    complete_a_session(client, auth_headers(token_a), session_template, today_iso)

    res_b = client.get("/history", headers=auth_headers(token_b))
    assert res_b.json() == []

    res_a = client.get("/history", headers=auth_headers(token_a))
    assert len(res_a.json()) == 1
