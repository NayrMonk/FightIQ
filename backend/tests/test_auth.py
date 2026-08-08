def test_register_creates_user_and_returns_token(client):
    res = client.post("/auth/register", json={"email": "new@test.com", "password": "password123"})
    assert res.status_code == 201
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_register_duplicate_email_rejected(client):
    client.post("/auth/register", json={"email": "dupe@test.com", "password": "password123"})
    res = client.post("/auth/register", json={"email": "dupe@test.com", "password": "password123"})
    assert res.status_code == 409


def test_register_invalid_email_rejected(client):
    res = client.post("/auth/register", json={"email": "not-an-email", "password": "password123"})
    assert res.status_code == 422


def test_login_with_correct_credentials(client):
    client.post("/auth/register", json={"email": "login@test.com", "password": "password123"})
    res = client.post("/auth/login", json={"email": "login@test.com", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_login_with_wrong_password_rejected(client):
    client.post("/auth/register", json={"email": "wrongpw@test.com", "password": "password123"})
    res = client.post("/auth/login", json={"email": "wrongpw@test.com", "password": "nope"})
    assert res.status_code == 401


def test_login_unknown_email_rejected(client):
    res = client.post("/auth/login", json={"email": "ghost@test.com", "password": "password123"})
    assert res.status_code == 401


def test_protected_route_requires_token(client):
    res = client.get("/profile/me")
    assert res.status_code in (401, 403)


def test_protected_route_rejects_garbage_token(client):
    res = client.get("/profile/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 401
