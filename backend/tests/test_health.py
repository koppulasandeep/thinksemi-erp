"""Health endpoint tests."""


def test_health_returns_ok(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"


def test_health_contains_app_name(client):
    resp = client.get("/api/v1/health")
    assert "Thinksemi" in resp.json()["app"]
