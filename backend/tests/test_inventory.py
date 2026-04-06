"""Inventory API tests — items CRUD, stock adjustments, valuation."""

import pytest


def test_list_items_empty(client, auth_headers):
    resp = client.get("/api/v1/inventory/items", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["items"] == []


def test_create_item(client, auth_headers):
    resp = client.post(
        "/api/v1/inventory/items",
        headers=auth_headers,
        json={
            "part_number": "CAP-100NF",
            "description": "100nF MLCC 0402",
            "stock_quantity": 5000,
            "reel_count": 5,
            "location": "Rack B1",
            "msl_level": 1,
            "reorder_point": 1000,
            "unit_price": 0.008,
        },
    )
    assert resp.status_code == 201
    assert resp.json()["part_number"] == "CAP-100NF"


def test_create_item_duplicate(client, auth_headers):
    payload = {
        "part_number": "DUP-001",
        "description": "Dup test",
        "stock_quantity": 10,
        "reel_count": 1,
        "location": "A1",
        "msl_level": 1,
        "reorder_point": 5,
    }
    client.post("/api/v1/inventory/items", headers=auth_headers, json=payload)
    resp = client.post("/api/v1/inventory/items", headers=auth_headers, json=payload)
    assert resp.status_code == 409


def test_list_items_with_data(client, auth_headers):
    for pn in ["ITEM-A", "ITEM-B"]:
        client.post(
            "/api/v1/inventory/items",
            headers=auth_headers,
            json={"part_number": pn, "description": pn, "stock_quantity": 10, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 5},
        )
    resp = client.get("/api/v1/inventory/items", headers=auth_headers)
    assert len(resp.json()["items"]) == 2


def test_list_items_search(client, auth_headers):
    for pn in ["STM32-MCU", "TJA-CAN"]:
        client.post(
            "/api/v1/inventory/items",
            headers=auth_headers,
            json={"part_number": pn, "description": pn, "stock_quantity": 10, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 5},
        )
    resp = client.get("/api/v1/inventory/items?search=STM", headers=auth_headers)
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["part_number"] == "STM32-MCU"


def test_list_items_low_stock(client, auth_headers):
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "LOW-1", "description": "low", "stock_quantity": 5, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 10})
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "HIGH-1", "description": "high", "stock_quantity": 100, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 10})
    resp = client.get("/api/v1/inventory/items?low_stock=true", headers=auth_headers)
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["part_number"] == "LOW-1"


def test_get_item(client, auth_headers):
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "GET-ME", "description": "get test", "stock_quantity": 42, "reel_count": 1, "location": "B2", "msl_level": 3, "reorder_point": 10})
    resp = client.get("/api/v1/inventory/items/GET-ME", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["stock_quantity"] == 42


def test_get_item_not_found(client, auth_headers):
    resp = client.get("/api/v1/inventory/items/NOPE", headers=auth_headers)
    assert resp.status_code == 404


def test_update_stock_positive(client, auth_headers):
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "ADJ-1", "description": "adj", "stock_quantity": 100, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 10})
    resp = client.patch("/api/v1/inventory/items/ADJ-1/stock", headers=auth_headers, json={"adjustment": 50, "reason": "received"})
    assert resp.status_code == 200
    assert resp.json()["stock_quantity"] == 150


def test_update_stock_negative(client, auth_headers):
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "ADJ-2", "description": "adj", "stock_quantity": 100, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 10})
    resp = client.patch("/api/v1/inventory/items/ADJ-2/stock", headers=auth_headers, json={"adjustment": -30, "reason": "consumed"})
    assert resp.status_code == 200
    assert resp.json()["stock_quantity"] == 70


def test_update_stock_below_zero(client, auth_headers):
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "ADJ-3", "description": "adj", "stock_quantity": 10, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 5})
    resp = client.patch("/api/v1/inventory/items/ADJ-3/stock", headers=auth_headers, json={"adjustment": -20})
    assert resp.status_code == 400


def test_inventory_valuation(client, auth_headers):
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "VAL-A", "description": "val a", "stock_quantity": 100, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 10, "unit_price": 10.0})
    client.post("/api/v1/inventory/items", headers=auth_headers, json={"part_number": "VAL-B", "description": "val b", "stock_quantity": 200, "reel_count": 1, "location": "A", "msl_level": 1, "reorder_point": 10, "unit_price": 5.0})
    resp = client.get("/api/v1/inventory/valuation", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_value"] == pytest.approx(2000.0)  # 100*10 + 200*5
