# ----------------- HEALTH & STATIC ENDPOINTS -----------------

def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("ok", "degraded")
    assert "checks" in data


def test_nav_map_and_route(client):
    # Venue Map
    map_resp = client.get("/api/nav/venue-map")
    assert map_resp.status_code == 200
    map_data = map_resp.json()
    assert "zones" in map_data
    assert "gates" in map_data
    assert "amenities" in map_data

    # Route
    route_resp = client.post(
        "/api/nav/route",
        json={"from_zone": "z1", "to_zone": "z3", "accessible": False}
    )
    assert route_resp.status_code == 200
    route_data = route_resp.json()
    assert route_data["total_distance_m"] > 0
    assert "steps" in route_data

    # Wayfinding
    wf_resp = client.post(
        "/api/nav/wayfinding",
        json={"from_zone": "z1", "to_zone": "z3", "accessible": True, "wheelchair": True}
    )
    assert wf_resp.status_code == 200
    wf_data = wf_resp.json()
    assert wf_data["total_distance_m"] > 0
    assert wf_data["accessible"] is True


def test_accessibility_endpoints(client):
    # Status
    status_resp = client.get("/api/accessibility/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert isinstance(status_data, list)
    assert len(status_data) > 0

    # AI Route
    ai_route_resp = client.post(
        "/api/accessibility/ai-route",
        json={"from_zone": "z1", "to_zone": "z4", "wheelchair": True, "avoid_crowds": True}
    )
    assert ai_route_resp.status_code == 200
    ai_route_data = ai_route_resp.json()
    assert "ai_summary" in ai_route_data
    assert "warnings" in ai_route_data


def test_sustainability_anonymous(client):
    # Tip
    tip_resp = client.get("/api/sustainability/tip?context=travel")
    assert tip_resp.status_code == 200
    assert "tip" in tip_resp.json()

    # Stations
    stations_resp = client.get("/api/sustainability/stations")
    assert stations_resp.status_code == 200
    assert len(stations_resp.json()["stations"]) > 0


def test_transport_status(client):
    resp = client.get("/api/transport/status")
    assert resp.status_code == 200
    assert "lines" in resp.json()


def test_ops_wait_times(client):
    resp = client.post(
        "/api/ops/wait-times",
        json={"zone": "all", "match_minute": 15, "match_status": "in_progress"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "locations" in data
    assert data["match_minute"] == 15


# ----------------- AUTHENTICATED ENDPOINTS -----------------

def test_auth_and_volunteer_flow(client):
    # Register a volunteer user
    reg_resp = client.post(
        "/api/auth/register",
        json={"email": "volunteer@fifa.com", "name": "Volunteer User", "password": "password123"}
    )
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    token = reg_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify we can access authenticated sustainability tips
    pers_tips_resp = client.get(
        "/api/sustainability/personalized-tips?zone=z1&match_status=in_progress",
        headers=headers
    )
    assert pers_tips_resp.status_code == 200
    assert len(pers_tips_resp.json()) == 3

    # Calculate carbon impact
    carbon_resp = client.post(
        "/api/sustainability/carbon-impact",
        json={"transport_mode": "transit", "distance_km": 15.5, "group_size": 1},
        headers=headers
    )
    assert carbon_resp.status_code == 200
    assert carbon_resp.json()["co2_kg"] > 0

    # Join volunteer program
    vol_resp = client.post(
        "/api/volunteer/volunteers",
        json={"name": "Volunteer User", "role": "usher", "zone": "z1", "languages": "en", "phone": "555-1234"},
        headers=headers
    )
    assert vol_resp.status_code == 200
    vol_data = vol_resp.json()
    vol_id = vol_data["id"]

    # View volunteer dashboard
    dash_resp = client.get("/api/volunteer/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["total"] == 1

    # List volunteers
    list_vols_resp = client.get("/api/volunteer/volunteers?role=usher", headers=headers)
    assert list_vols_resp.status_code == 200
    assert len(list_vols_resp.json()) == 1

    # Get specific volunteer
    get_vol_resp = client.get(f"/api/volunteer/volunteers/{vol_id}", headers=headers)
    assert get_vol_resp.status_code == 200
    assert get_vol_resp.json()["name"] == "Volunteer User"

    # Update volunteer
    upd_resp = client.patch(
        f"/api/volunteer/volunteers/{vol_id}",
        json={"status": "available", "zone": "z2"},
        headers=headers
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["zone"] == "z2"

    # Create volunteer task
    task_resp = client.post(
        "/api/volunteer/tasks",
        json={"volunteer_id": vol_id, "task_type": "crowd", "description": "Assist crowd at Gate B", "zone": "z2", "priority": "high"},
        headers=headers
    )
    assert task_resp.status_code == 200
    task_data = task_resp.json()
    task_id = task_data["id"]

    # List tasks
    list_tasks_resp = client.get("/api/volunteer/tasks", headers=headers)
    assert list_tasks_resp.status_code == 200
    assert len(list_tasks_resp.json()) == 1

    # Update task status to completed
    task_upd_resp = client.patch(
        f"/api/volunteer/tasks/{task_id}",
        json={"status": "completed", "volunteer_id": vol_id},
        headers=headers
    )
    assert task_upd_resp.status_code == 200
    assert task_upd_resp.json()["status"] == "completed"
