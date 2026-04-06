"""Supply chain API tests — sales orders, suppliers."""

from datetime import date, timedelta


def test_create_sales_order(client, auth_headers):
    resp = client.post(
        "/api/v1/supply-chain/sales-orders",
        headers=auth_headers,
        json={
            "customer_name": "Bosch India",
            "board_name": "ECU-X500",
            "quantity": 1000,
            "unit_price": 450,
            "due_date": str(date.today() + timedelta(days=30)),
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_name"] == "Bosch India"
    assert data["total_value"] == 450000


def test_list_sales_orders(client, auth_headers):
    for cust in ["A Corp", "B Corp"]:
        client.post(
            "/api/v1/supply-chain/sales-orders",
            headers=auth_headers,
            json={"customer_name": cust, "board_name": "PCB", "quantity": 100, "unit_price": 10, "due_date": str(date.today() + timedelta(days=30))},
        )
    resp = client.get("/api/v1/supply-chain/sales-orders", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["sales_orders"]) == 2


def test_list_sales_orders_filter_status(client, auth_headers):
    client.post("/api/v1/supply-chain/sales-orders", headers=auth_headers, json={"customer_name": "X", "board_name": "PCB", "quantity": 100, "unit_price": 10, "due_date": str(date.today() + timedelta(days=30)), "status": "draft"})
    resp = client.get("/api/v1/supply-chain/sales-orders?status=draft", headers=auth_headers)
    orders = resp.json()["sales_orders"]
    assert all(o["status"] == "draft" for o in orders)


def test_list_sales_orders_search(client, auth_headers):
    client.post("/api/v1/supply-chain/sales-orders", headers=auth_headers, json={"customer_name": "Bosch India", "board_name": "PCB", "quantity": 100, "unit_price": 10, "due_date": str(date.today() + timedelta(days=30))})
    client.post("/api/v1/supply-chain/sales-orders", headers=auth_headers, json={"customer_name": "Continental", "board_name": "PCB", "quantity": 100, "unit_price": 10, "due_date": str(date.today() + timedelta(days=30))})
    resp = client.get("/api/v1/supply-chain/sales-orders?search=Bosch", headers=auth_headers)
    assert len(resp.json()["sales_orders"]) == 1


def test_create_supplier(client, auth_headers):
    resp = client.post(
        "/api/v1/supply-chain/suppliers",
        headers=auth_headers,
        json={"name": "Mouser Electronics", "location": "USA", "category": "components", "contact_person": "John", "email": "j@mouser.com", "phone": "+1-555-0100"},
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Mouser Electronics"


def test_list_suppliers(client, auth_headers):
    client.post("/api/v1/supply-chain/suppliers", headers=auth_headers, json={"name": "Mouser", "location": "USA", "category": "components", "contact_person": "A", "email": "a@m.com", "phone": "1"})
    client.post("/api/v1/supply-chain/suppliers", headers=auth_headers, json={"name": "Digi-Key", "location": "USA", "category": "components", "contact_person": "B", "email": "b@d.com", "phone": "2"})
    resp = client.get("/api/v1/supply-chain/suppliers", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["suppliers"]) == 2


def test_list_bom_items(client, auth_headers):
    """BOM list for a non-existent board returns empty list."""
    resp = client.get("/api/v1/supply-chain/bom/NONEXISTENT", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["items"] == []


def test_list_purchase_orders(client, auth_headers):
    resp = client.get("/api/v1/supply-chain/purchase-orders", headers=auth_headers)
    assert resp.status_code == 200
    assert "purchase_orders" in resp.json()
