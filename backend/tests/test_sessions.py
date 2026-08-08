from tests.conftest import auth_headers, register_user


def test_today_session_is_null_when_none_scheduled(client, session_template):
    token = register_user(client)
    res = client.get("/sessions/today", headers=auth_headers(token))
    assert res.status_code == 200
    assert res.json() is None


def test_start_session_creates_in_progress_session(client, session_template, today_iso):
    token = register_user(client)
    res = client.post(
        "/sessions",
        headers=auth_headers(token),
        json={"session_template_id": session_template.id, "scheduled_date": today_iso},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "in_progress"
    assert body["session_template"]["id"] == session_template.id


def test_start_session_is_idempotent_for_same_slot(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    payload = {"session_template_id": session_template.id, "scheduled_date": today_iso}

    first = client.post("/sessions", headers=headers, json=payload)
    second = client.post("/sessions", headers=headers, json=payload)

    assert first.json()["id"] == second.json()["id"]


def test_today_session_reflects_started_session(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    client.post("/sessions", headers=headers, json={"session_template_id": session_template.id, "scheduled_date": today_iso})

    res = client.get("/sessions/today", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "in_progress"
    assert len(body["session_template"]["rounds"]) == 2


def test_get_session_detail_rejects_other_users_session(client, session_template, today_iso):
    token_a = register_user(client, "usera@test.com")
    token_b = register_user(client, "userb@test.com")

    start_res = client.post(
        "/sessions",
        headers=auth_headers(token_a),
        json={"session_template_id": session_template.id, "scheduled_date": today_iso},
    )
    session_id = start_res.json()["id"]

    res = client.get(f"/sessions/{session_id}", headers=auth_headers(token_b))
    assert res.status_code == 404


def test_complete_session_records_result_and_awards_pr(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    start_res = client.post(
        "/sessions",
        headers=headers,
        json={"session_template_id": session_template.id, "scheduled_date": today_iso},
    )
    session_id = start_res.json()["id"]

    res = client.post(
        f"/sessions/{session_id}/complete",
        headers=headers,
        json={"rounds_completed": 2, "total_duration_sec": 480, "perceived_intensity": 7},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["session"]["status"] == "completed"
    assert body["session"]["result"]["rounds_completed"] == 2
    record_types = [r["record_type"] for r in body["new_personal_records"]]
    assert "most_rounds_session" in record_types
    assert "longest_streak" in record_types


def test_complete_session_second_time_updates_result_without_duplicate_pr_row(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    start_res = client.post(
        "/sessions",
        headers=headers,
        json={"session_template_id": session_template.id, "scheduled_date": today_iso},
    )
    session_id = start_res.json()["id"]

    client.post(
        f"/sessions/{session_id}/complete",
        headers=headers,
        json={"rounds_completed": 2, "total_duration_sec": 480, "perceived_intensity": 7},
    )
    res = client.post(
        f"/sessions/{session_id}/complete",
        headers=headers,
        json={"rounds_completed": 2, "total_duration_sec": 500, "perceived_intensity": 8, "notes": "felt good"},
    )
    assert res.status_code == 200
    assert res.json()["session"]["result"]["total_duration_sec"] == 500
    assert res.json()["session"]["result"]["notes"] == "felt good"


def test_patch_session_status_updates_status(client, session_template, today_iso):
    token = register_user(client)
    headers = auth_headers(token)
    start_res = client.post(
        "/sessions",
        headers=headers,
        json={"session_template_id": session_template.id, "scheduled_date": today_iso},
    )
    session_id = start_res.json()["id"]

    res = client.patch(f"/sessions/{session_id}", headers=headers, json={"status": "skipped"})
    assert res.status_code == 200
    assert res.json()["status"] == "skipped"


def test_patch_session_404_for_missing_session(client):
    token = register_user(client)
    res = client.patch("/sessions/999", headers=auth_headers(token), json={"status": "skipped"})
    assert res.status_code == 404
