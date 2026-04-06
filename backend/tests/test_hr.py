"""HR API tests — employees, attendance, leave management."""

import uuid
from datetime import date, timedelta


def test_list_employees_empty(client, auth_headers):
    resp = client.get("/api/v1/hr/employees", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["employees"] == []


def test_create_employee(client, auth_headers):
    resp = client.post(
        "/api/v1/hr/employees",
        headers=auth_headers,
        json={"name": "John Doe", "department": "Engineering", "designation": "Engineer"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "John Doe"
    assert data["emp_code"] == "EMP-001"


def test_create_employee_requires_admin(client, operator_headers):
    resp = client.post(
        "/api/v1/hr/employees",
        headers=operator_headers,
        json={"name": "Should Fail"},
    )
    assert resp.status_code == 403


def test_list_employees_filter_department(client, auth_headers):
    client.post("/api/v1/hr/employees", headers=auth_headers, json={"name": "A", "department": "Engineering"})
    client.post("/api/v1/hr/employees", headers=auth_headers, json={"name": "B", "department": "HR"})
    resp = client.get("/api/v1/hr/employees?department=Engineering", headers=auth_headers)
    emps = resp.json()["employees"]
    assert len(emps) == 1
    assert emps[0]["department"] == "Engineering"


def test_list_employees_search(client, auth_headers):
    client.post("/api/v1/hr/employees", headers=auth_headers, json={"name": "Alice Wonder"})
    client.post("/api/v1/hr/employees", headers=auth_headers, json={"name": "Bob Builder"})
    resp = client.get("/api/v1/hr/employees?search=Alice", headers=auth_headers)
    assert len(resp.json()["employees"]) == 1


def _create_employee(client, auth_headers, name="Test Emp"):
    resp = client.post("/api/v1/hr/employees", headers=auth_headers, json={"name": name})
    return resp.json()["id"]


def test_create_leave_request(client, auth_headers):
    emp_id = _create_employee(client, auth_headers)
    today = date.today()
    resp = client.post(
        "/api/v1/hr/leave-requests",
        headers=auth_headers,
        json={
            "employee_id": emp_id,
            "leave_type": "CL",
            "from_date": str(today + timedelta(days=5)),
            "to_date": str(today + timedelta(days=6)),
            "reason": "Personal",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["days"] == 2


def test_leave_request_invalid_dates(client, auth_headers):
    emp_id = _create_employee(client, auth_headers)
    today = date.today()
    resp = client.post(
        "/api/v1/hr/leave-requests",
        headers=auth_headers,
        json={
            "employee_id": emp_id,
            "leave_type": "CL",
            "from_date": str(today + timedelta(days=5)),
            "to_date": str(today + timedelta(days=3)),  # before from_date
        },
    )
    assert resp.status_code == 400


def test_approve_leave(client, auth_headers):
    emp_id = _create_employee(client, auth_headers)
    today = date.today()
    lr = client.post(
        "/api/v1/hr/leave-requests",
        headers=auth_headers,
        json={"employee_id": emp_id, "leave_type": "EL", "from_date": str(today + timedelta(days=10)), "to_date": str(today + timedelta(days=12))},
    ).json()
    resp = client.patch(f"/api/v1/hr/leave-requests/{lr['id']}/approve", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"


def test_approve_non_pending(client, auth_headers):
    emp_id = _create_employee(client, auth_headers)
    today = date.today()
    lr = client.post(
        "/api/v1/hr/leave-requests",
        headers=auth_headers,
        json={"employee_id": emp_id, "leave_type": "EL", "from_date": str(today + timedelta(days=10)), "to_date": str(today + timedelta(days=12))},
    ).json()
    client.patch(f"/api/v1/hr/leave-requests/{lr['id']}/approve", headers=auth_headers)
    resp = client.patch(f"/api/v1/hr/leave-requests/{lr['id']}/approve", headers=auth_headers)
    assert resp.status_code == 400


def test_mark_attendance(client, auth_headers):
    emp_id = _create_employee(client, auth_headers)
    today = date.today()
    resp = client.post(
        "/api/v1/hr/attendance/mark",
        headers=auth_headers,
        json={"employee_id": emp_id, "date": str(today), "status": "P", "shift_hours": 8},
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "P"
