"""Auth endpoint tests — login, /me, token validation."""

from tests.conftest import ADMIN_USER_ID, TENANT_ID


def test_login_form_success(client, test_user):
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@test.com", "password": "testpass123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@test.com"


def test_login_json_success(client, test_user):
    resp = client.post(
        "/api/v1/auth/login/json",
        json={"email": "admin@test.com", "password": "testpass123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


def test_login_wrong_password(client, test_user):
    resp = client.post(
        "/api/v1/auth/login/json",
        json={"email": "admin@test.com", "password": "wrong"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid credentials"


def test_login_nonexistent_user(client, test_tenant):
    resp = client.post(
        "/api/v1/auth/login/json",
        json={"email": "nobody@test.com", "password": "testpass123"},
    )
    assert resp.status_code == 401


def test_login_inactive_user(client, inactive_user):
    resp = client.post(
        "/api/v1/auth/login/json",
        json={"email": "inactive@test.com", "password": "testpass123"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Account disabled"


def test_me_authenticated(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@test.com"
    assert data["id"] == str(ADMIN_USER_ID)


def test_me_no_token(client, test_tenant):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_expired_token(client, expired_headers):
    resp = client.get("/api/v1/auth/me", headers=expired_headers)
    assert resp.status_code == 401


def test_me_invalid_token(client, test_tenant):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401


def test_login_updates_last_login(client, test_user, db_session):
    from app.models.user import User

    assert test_user.last_login is None
    client.post(
        "/api/v1/auth/login/json",
        json={"email": "admin@test.com", "password": "testpass123"},
    )
    db_session.refresh(test_user)
    assert test_user.last_login is not None
