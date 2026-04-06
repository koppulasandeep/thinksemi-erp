"""Quality API tests — NCR, CAPA, metrics."""

import uuid


def test_create_ncr(client, auth_headers):
    resp = client.post(
        "/api/v1/quality/ncr",
        headers=auth_headers,
        json={"title": "Solder bridge on U1", "description": "Pins 45-46 bridged", "defect_type": "solder", "severity": "major", "quantity_affected": 5},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Solder bridge on U1"
    assert "ref_number" in data


def test_list_ncrs(client, auth_headers):
    client.post("/api/v1/quality/ncr", headers=auth_headers, json={"title": "NCR A", "description": "desc", "defect_type": "solder", "severity": "minor", "quantity_affected": 1})
    client.post("/api/v1/quality/ncr", headers=auth_headers, json={"title": "NCR B", "description": "desc", "defect_type": "component", "severity": "major", "quantity_affected": 3})
    resp = client.get("/api/v1/quality/ncr", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["ncrs"]) == 2


def test_list_ncrs_filter_severity(client, auth_headers):
    client.post("/api/v1/quality/ncr", headers=auth_headers, json={"title": "Minor", "description": "d", "defect_type": "solder", "severity": "minor", "quantity_affected": 1})
    client.post("/api/v1/quality/ncr", headers=auth_headers, json={"title": "Critical", "description": "d", "defect_type": "solder", "severity": "critical", "quantity_affected": 1})
    resp = client.get("/api/v1/quality/ncr?severity=critical", headers=auth_headers)
    ncrs = resp.json()["ncrs"]
    assert len(ncrs) == 1
    assert ncrs[0]["severity"] == "critical"


def test_get_ncr(client, auth_headers):
    ncr = client.post("/api/v1/quality/ncr", headers=auth_headers, json={"title": "Get me", "description": "d", "defect_type": "solder", "severity": "minor", "quantity_affected": 1}).json()
    resp = client.get(f"/api/v1/quality/ncr/{ncr['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Get me"


def test_update_ncr_status(client, auth_headers):
    ncr = client.post("/api/v1/quality/ncr", headers=auth_headers, json={"title": "Status test", "description": "d", "defect_type": "solder", "severity": "minor", "quantity_affected": 1}).json()
    resp = client.patch(f"/api/v1/quality/ncr/{ncr['id']}/status", headers=auth_headers, json={"status": "investigating"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "investigating"


def test_ncr_not_found(client, auth_headers):
    resp = client.get(f"/api/v1/quality/ncr/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


def test_create_capa(client, auth_headers):
    resp = client.post(
        "/api/v1/quality/capa",
        headers=auth_headers,
        json={"title": "Fix solder profile", "capa_type": "corrective", "description": "Adjust reflow temperature"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Fix solder profile"
    assert "ref_number" in data


def test_update_capa_status(client, auth_headers):
    capa = client.post("/api/v1/quality/capa", headers=auth_headers, json={"title": "CAPA test", "capa_type": "preventive", "description": "d"}).json()
    resp = client.patch(f"/api/v1/quality/capa/{capa['id']}/status", headers=auth_headers, json={"status": "in_progress"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_progress"


def test_quality_metrics(client, auth_headers):
    resp = client.get("/api/v1/quality/metrics", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "open_ncrs" in data
    assert "fpy" in data


def test_list_capas(client, auth_headers):
    client.post("/api/v1/quality/capa", headers=auth_headers, json={"title": "CAPA 1", "capa_type": "corrective", "description": "d"})
    resp = client.get("/api/v1/quality/capa", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["capas"]) == 1
