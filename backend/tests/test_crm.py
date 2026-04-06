"""CRM API tests — leads, contacts, quotations."""


def test_create_lead(client, auth_headers):
    resp = client.post(
        "/api/v1/crm/leads",
        headers=auth_headers,
        json={"company": "Acme Corp", "contact_person": "John Doe", "product": "Board-X", "value": 500000, "stage": "new_lead"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["company"] == "Acme Corp"
    assert "ref_number" in data


def test_list_leads(client, auth_headers):
    client.post("/api/v1/crm/leads", headers=auth_headers, json={"company": "A Corp", "contact_person": "A", "stage": "new_lead"})
    client.post("/api/v1/crm/leads", headers=auth_headers, json={"company": "B Corp", "contact_person": "B", "stage": "qualified"})
    resp = client.get("/api/v1/crm/leads", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["leads"]) == 2


def test_list_leads_filter_stage(client, auth_headers):
    client.post("/api/v1/crm/leads", headers=auth_headers, json={"company": "A", "contact_person": "A", "stage": "new_lead"})
    client.post("/api/v1/crm/leads", headers=auth_headers, json={"company": "B", "contact_person": "B", "stage": "won"})
    resp = client.get("/api/v1/crm/leads?stage=won", headers=auth_headers)
    leads = resp.json()["leads"]
    assert len(leads) == 1
    assert leads[0]["stage"] == "won"


def test_get_lead(client, auth_headers):
    lead = client.post("/api/v1/crm/leads", headers=auth_headers, json={"company": "Test Co", "contact_person": "TC", "stage": "new_lead"}).json()
    resp = client.get(f"/api/v1/crm/leads/{lead['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["company"] == "Test Co"


def test_update_lead_stage(client, auth_headers):
    lead = client.post("/api/v1/crm/leads", headers=auth_headers, json={"company": "Stage Test", "contact_person": "ST", "stage": "new_lead"}).json()
    resp = client.patch(f"/api/v1/crm/leads/{lead['id']}/stage", headers=auth_headers, json={"stage": "qualified"})
    assert resp.status_code == 200
    assert resp.json()["stage"] == "qualified"


def test_create_contact(client, auth_headers):
    resp = client.post(
        "/api/v1/crm/contacts",
        headers=auth_headers,
        json={"name": "Jane Smith", "company": "Smith Inc", "email": "jane@smith.com"},
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Jane Smith"


def test_list_contacts(client, auth_headers):
    client.post("/api/v1/crm/contacts", headers=auth_headers, json={"name": "Contact A"})
    client.post("/api/v1/crm/contacts", headers=auth_headers, json={"name": "Contact B"})
    resp = client.get("/api/v1/crm/contacts", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["contacts"]) == 2


def test_create_quotation(client, auth_headers):
    resp = client.post(
        "/api/v1/crm/quotations",
        headers=auth_headers,
        json={
            "customer_name": "Test Customer",
            "board_name": "PCB-001",
            "quantity": 1000,
            "bare_pcb_cost": 50000,
            "component_cost": 100000,
            "smt_cost": 25000,
            "tht_cost": 10000,
            "testing_cost": 5000,
            "stencil_cost": 3000,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_name"] == "Test Customer"
    assert "ref_number" in data


def test_lead_not_found(client, auth_headers):
    import uuid
    resp = client.get(f"/api/v1/crm/leads/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404
