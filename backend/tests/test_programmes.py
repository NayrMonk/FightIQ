from tests.conftest import auth_headers, register_user


def test_list_programmes_requires_auth(client):
    res = client.get("/programmes")
    assert res.status_code in (401, 403)


def test_list_programmes_returns_seeded_programme(client, session_template):
    token = register_user(client)
    res = client.get("/programmes", headers=auth_headers(token))
    assert res.status_code == 200
    names = [p["name"] for p in res.json()]
    assert "Boxing Fundamentals" in names


def test_list_programmes_filters_by_discipline(client, session_template):
    token = register_user(client)
    res = client.get("/programmes?discipline=boxing", headers=auth_headers(token))
    assert res.status_code == 200
    assert len(res.json()) == 1

    res_empty = client.get("/programmes?discipline=mma", headers=auth_headers(token))
    assert res_empty.json() == []


def test_get_programme_detail_404_for_unknown_id(client):
    token = register_user(client)
    res = client.get("/programmes/999", headers=auth_headers(token))
    assert res.status_code == 404


def test_get_session_template_detail_includes_rounds_and_exercises(client, session_template):
    token = register_user(client)
    res = client.get(f"/session-templates/{session_template.id}", headers=auth_headers(token))
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "Jab-Cross Foundations"
    assert len(body["rounds"]) == 2
    assert body["rounds"][0]["round_exercises"][0]["exercise"]["name"] == "Shadowboxing"


def test_get_session_template_404_for_unknown_id(client):
    token = register_user(client)
    res = client.get("/session-templates/999", headers=auth_headers(token))
    assert res.status_code == 404
