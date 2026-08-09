def test_register_token_and_list_and_mark_all_read(client):
    res = client.post("/auth/register", json={"email": "notif1@test.com", "password": "password123"})
    hdr = {"Authorization": f"Bearer {res.json()['access_token']}"}

    reg = client.post("/notifications/register-token", json={"expo_push_token": "ExponentPushToken[abc123]"}, headers=hdr)
    assert reg.status_code == 204

    # re-registering the same token is an upsert, not a duplicate error
    assert client.post("/notifications/register-token", json={"expo_push_token": "ExponentPushToken[abc123]"}, headers=hdr).status_code == 204

    assert client.get("/notifications", headers=hdr).json() == []
    assert client.post("/notifications/mark-all-read", headers=hdr).status_code == 204


def test_following_a_user_who_completes_a_session_creates_notification(client, db_session, session_template, today_iso):
    from app.models.user import User

    r_a = client.post("/auth/register", json={"email": "notifa@test.com", "password": "password123"})
    r_b = client.post("/auth/register", json={"email": "notifb@test.com", "password": "password123"})
    hdr_a = {"Authorization": f"Bearer {r_a.json()['access_token']}"}
    hdr_b = {"Authorization": f"Bearer {r_b.json()['access_token']}"}

    uid_b = db_session.query(User).filter(User.email == "notifb@test.com").first().id

    client.post(f"/social/follow/{uid_b}", headers=hdr_a)

    start = client.post(
        "/sessions", json={"session_template_id": session_template.id, "scheduled_date": today_iso}, headers=hdr_b
    )
    sid = start.json()["id"]
    comp = client.post(f"/sessions/{sid}/complete", json={"rounds_completed": 2, "total_duration_sec": 300}, headers=hdr_b)
    assert comp.status_code == 200

    notifications = client.get("/notifications", headers=hdr_a).json()
    assert any(n["type"] == "new_activity" for n in notifications)
