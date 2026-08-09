import re


def _extract_token(captured_out: str, label: str) -> str:
    match = re.search(rf"{label}: (\S+)", captured_out)
    assert match, f"expected to find '{label}' in captured output: {captured_out!r}"
    return match.group(1)


def test_register_returns_refresh_token(client):
    res = client.post("/auth/register", json={"email": "refresh1@test.com", "password": "password123"})
    assert res.status_code == 201
    body = res.json()
    assert body["refresh_token"]
    assert body["access_token"]


def test_refresh_rotates_token_and_old_one_stops_working(client):
    res = client.post("/auth/register", json={"email": "refresh2@test.com", "password": "password123"})
    old_refresh = res.json()["refresh_token"]

    refreshed = client.post("/auth/refresh", json={"refresh_token": old_refresh})
    assert refreshed.status_code == 200
    new_body = refreshed.json()
    assert new_body["access_token"]
    assert new_body["refresh_token"] != old_refresh

    reuse = client.post("/auth/refresh", json={"refresh_token": old_refresh})
    assert reuse.status_code == 401


def test_refresh_rejects_garbage_token(client):
    res = client.post("/auth/refresh", json={"refresh_token": "not-a-real-token"})
    assert res.status_code == 401


def test_logout_revokes_refresh_token(client):
    res = client.post("/auth/register", json={"email": "refresh3@test.com", "password": "password123"})
    refresh_token = res.json()["refresh_token"]

    assert client.post("/auth/logout", json={"refresh_token": refresh_token}).status_code == 204
    assert client.post("/auth/refresh", json={"refresh_token": refresh_token}).status_code == 401


def test_forgot_password_always_returns_200(client):
    assert client.post("/auth/forgot-password", json={"email": "ghost404@test.com"}).status_code == 200
    assert client.post("/auth/forgot-password", json={"email": "ghost404@test.com"}).status_code == 200


def test_reset_password_flow(client, capsys):
    client.post("/auth/register", json={"email": "reset1@test.com", "password": "password123"})
    capsys.readouterr()  # clear the verify-email token print from register

    client.post("/auth/forgot-password", json={"email": "reset1@test.com"})
    out = capsys.readouterr().out
    reset_token = _extract_token(out, "password reset token for reset1@test.com")

    bad = client.post("/auth/reset-password", json={"token": "wrong-token", "new_password": "newpass123"})
    assert bad.status_code == 400

    ok = client.post("/auth/reset-password", json={"token": reset_token, "new_password": "newpass123"})
    assert ok.status_code == 204

    # token is single-use
    assert client.post("/auth/reset-password", json={"token": reset_token, "new_password": "again123"}).status_code == 400

    # old password no longer works, new one does
    assert client.post("/auth/login", json={"email": "reset1@test.com", "password": "password123"}).status_code == 401
    assert client.post("/auth/login", json={"email": "reset1@test.com", "password": "newpass123"}).status_code == 200


def test_reset_password_revokes_existing_refresh_tokens(client, capsys):
    res = client.post("/auth/register", json={"email": "reset2@test.com", "password": "password123"})
    refresh_token = res.json()["refresh_token"]
    capsys.readouterr()

    client.post("/auth/forgot-password", json={"email": "reset2@test.com"})
    reset_token = _extract_token(capsys.readouterr().out, "password reset token for reset2@test.com")
    client.post("/auth/reset-password", json={"token": reset_token, "new_password": "newpass456"})

    assert client.post("/auth/refresh", json={"refresh_token": refresh_token}).status_code == 401


def test_verify_email_flow(client, capsys):
    client.post("/auth/register", json={"email": "verify1@test.com", "password": "password123"})
    out = capsys.readouterr().out
    verify_token = _extract_token(out, "email verification token for verify1@test.com")

    bad = client.post("/auth/verify-email", json={"token": "wrong-token"})
    assert bad.status_code == 400

    ok = client.post("/auth/verify-email", json={"token": verify_token})
    assert ok.status_code == 204

    assert client.post("/auth/verify-email", json={"token": verify_token}).status_code == 400


def test_admin_users_requires_admin_role(client):
    res = client.post("/auth/register", json={"email": "notadmin@test.com", "password": "password123"})
    token = res.json()["access_token"]
    assert client.get("/admin/users", headers={"Authorization": f"Bearer {token}"}).status_code == 403


def test_admin_users_allows_admin_role(client, db_session):
    from app.core.security import hash_password
    from app.models.user import User

    admin = User(email="admin1@test.com", hashed_password=hash_password("password123"), role="admin")
    db_session.add(admin)
    db_session.commit()

    login = client.post("/auth/login", json={"email": "admin1@test.com", "password": "password123"})
    token = login.json()["access_token"]
    res = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert any(u["email"] == "admin1@test.com" for u in res.json())
