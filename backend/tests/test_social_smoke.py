from datetime import date, timedelta


def test_follow_feed_leaderboard_challenge_flow(client, db_session, session_template, today_iso):
    # register two users
    r1 = client.post("/auth/register", json={"email": "a@test.com", "password": "password123"})
    r2 = client.post("/auth/register", json={"email": "b@test.com", "password": "password123"})
    tok_a = r1.json()["access_token"]
    tok_b = r2.json()["access_token"]
    hdr_a = {"Authorization": f"Bearer {tok_a}"}
    hdr_b = {"Authorization": f"Bearer {tok_b}"}

    user_b_id = client.get("/profile/me", headers=hdr_b).status_code  # just ensure endpoint alive
    # get b's id via admin? simpler: use /social/following after follow by email lookup isn't available,
    # so fetch id from followers list workaround: register returns no id, use DB directly
    from app.models.user import User
    uid_b = db_session.query(User).filter(User.email == "b@test.com").first().id
    uid_a = db_session.query(User).filter(User.email == "a@test.com").first().id

    # follow self should fail
    assert client.post(f"/social/follow/{uid_a}", headers=hdr_a).status_code == 400
    # follow non-existent
    assert client.post("/social/follow/99999", headers=hdr_a).status_code == 404
    # a follows b
    res = client.post(f"/social/follow/{uid_b}", headers=hdr_a)
    assert res.status_code == 201, res.text
    # duplicate follow
    assert client.post(f"/social/follow/{uid_b}", headers=hdr_a).status_code == 409

    assert [u["id"] for u in client.get("/social/following", headers=hdr_a).json()] == [uid_b]
    assert [u["id"] for u in client.get("/social/followers", headers=hdr_b).json()] == [uid_a]

    # b completes a session -> activity event
    start = client.post("/sessions", json={"session_template_id": session_template.id, "scheduled_date": today_iso}, headers=hdr_b)
    sid = start.json()["id"]
    comp = client.post(f"/sessions/{sid}/complete", json={"rounds_completed": 2, "total_duration_sec": 300}, headers=hdr_b)
    assert comp.status_code == 200

    feed = client.get("/social/feed", headers=hdr_a).json()
    assert len(feed) >= 1
    assert feed[0]["event_type"] == "session_completed"
    assert feed[0]["user"]["id"] == uid_b

    lb = client.get("/social/leaderboard?metric=sessions&scope=following", headers=hdr_a).json()
    assert any(e["user"]["id"] == uid_b and e["value"] == 1.0 for e in lb)

    # unfollow
    assert client.delete(f"/social/follow/{uid_b}", headers=hdr_a).status_code == 204
    assert client.get("/social/following", headers=hdr_a).json() == []

    # challenge: athlete role forbidden
    payload = {
        "title": "10 sessions",
        "description": None,
        "metric": "total_sessions",
        "target_value": 1,
        "start_date": (date.today() - timedelta(days=1)).isoformat(),
        "end_date": (date.today() + timedelta(days=30)).isoformat(),
    }
    assert client.post("/social/challenges", json=payload, headers=hdr_a).status_code == 403

    # make a coach
    from app.core.security import hash_password
    coach = User(email="coach2@test.com", hashed_password=hash_password("password123"), role="coach")
    db_session.add(coach)
    db_session.commit()
    login = client.post("/auth/login", json={"email": "coach2@test.com", "password": "password123"})
    hdr_c = {"Authorization": f"Bearer {login.json()['access_token']}"}

    created = client.post("/social/challenges", json=payload, headers=hdr_c)
    assert created.status_code == 201, created.text
    cid = created.json()["id"]

    assert client.get("/social/challenges", headers=hdr_a).status_code == 200

    join = client.post(f"/social/challenges/{cid}/join", headers=hdr_b)
    assert join.status_code == 201
    assert client.post(f"/social/challenges/{cid}/join", headers=hdr_b).status_code == 409
    assert client.post("/social/challenges/99999/join", headers=hdr_b).status_code == 404

    detail = client.get(f"/social/challenges/{cid}", headers=hdr_a).json()
    assert detail["participant_count"] == 1
    participant = detail["participants"][0]
    assert participant["current_value"] == 1.0  # b completed 1 session
    assert participant["completed_at"] is not None  # target_value=1, crossed
