from tests.conftest import auth_headers, register_user


def test_get_profile_returns_empty_stub_after_register(client):
    token = register_user(client, "profileget@test.com")
    res = client.get("/profile/me", headers=auth_headers(token))
    assert res.status_code == 200
    body = res.json()
    assert body["display_name"] is None


def test_update_profile_persists_fields(client):
    token = register_user(client, "profileupdate@test.com")
    res = client.put(
        "/profile/me",
        headers=auth_headers(token),
        json={"display_name": "Alex Rivera", "primary_discipline": "boxing", "experience_level": "intermediate"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["display_name"] == "Alex Rivera"
    assert body["primary_discipline"] == "boxing"

    res2 = client.get("/profile/me", headers=auth_headers(token))
    assert res2.json()["display_name"] == "Alex Rivera"


def test_update_profile_partial_update_preserves_other_fields(client):
    token = register_user(client, "partial@test.com")
    client.put("/profile/me", headers=auth_headers(token), json={"display_name": "Original Name"})
    res = client.put("/profile/me", headers=auth_headers(token), json={"weight_kg": 70.5})
    assert res.status_code == 200
    body = res.json()
    assert body["display_name"] == "Original Name"
    assert body["weight_kg"] == 70.5
