from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from jose import jwt

from app.main import settings
from conftest import register_user


def make_farm(client: TestClient, headers: dict, *, name="Test Farm", area=5):
    response = client.post(
        "/api/v1/farms",
        headers=headers,
        json={"farm_name": name, "total_area": area, "area_unit": "Acres", "latitude": 12.97, "longitude": 77.59},
    )
    assert response.status_code == 201, response.text
    return response.json()


def make_field(client: TestClient, headers: dict, farm: dict, *, area=2):
    response = client.post(
        f"/api/v1/farms/{farm['id']}/fields",
        headers=headers,
        json={"field_name": "Tomatoes", "crop_type": "tomato", "soil_type": "Loamy", "area": area, "area_unit": "Acres"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_health_and_openapi_bearer_security(client):
    assert client.get("/health").json() == {"status": "ok"}
    schema = client.get("/openapi.json").json()
    scheme = schema["components"]["securitySchemes"]["BearerAuth"]
    assert scheme["scheme"] == "bearer"
    assert scheme["bearerFormat"] == "JWT"
    assert "Do not include the 'Bearer ' prefix" in scheme["description"]
    assert schema["paths"]["/api/v1/auth/me"]["get"]["security"] == [{"BearerAuth": []}]
    assert schema["paths"]["/api/v1/auth/logout"]["post"]["security"] == [{"BearerAuth": []}]
    cors = client.options(
        "/api/v1/farms",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": "authorization"},
    )
    assert cors.status_code == 200
    assert cors.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_register_login_and_passwords_are_not_returned(client):
    result, headers = register_user(client)
    assert result["token_type"] == "bearer"
    assert "password" not in result and "password_hash" not in result
    claims = jwt.decode(result["access_token"], settings.jwt_secret_key, algorithms=["HS256"])
    assert claims["sub"] == result["user"]["id"]
    assert claims["type"] == "access"
    assert claims["exp"] > datetime.now(timezone.utc).timestamp()
    assert client.get("/api/v1/auth/me", headers=headers).json()["email"] == "farmer@example.com"

    login = client.post("/api/v1/auth/login", json={"email": "farmer@example.com", "password": "TestPassword@2026"})
    assert login.status_code == 200
    assert "password_hash" not in login.json()
    invalid = client.post("/api/v1/auth/login", json={"email": "farmer@example.com", "password": "wrong-password"})
    assert invalid.status_code == 401
    duplicate = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Duplicate", "email": "farmer@example.com", "password": "TestPassword@2026"},
    )
    assert duplicate.status_code == 409


def test_missing_invalid_expired_refresh_and_logout_auth_behavior(client):
    result, headers = register_user(client)
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer malformed"}).status_code == 401
    expired = jwt.encode(
        {"sub": result["user"]["id"], "type": "access", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)},
        settings.jwt_secret_key,
        algorithm="HS256",
    )
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired}"}).status_code == 401

    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": result["refresh_token"]})
    assert refreshed.status_code == 200
    new_headers = {"Authorization": f"Bearer {refreshed.json()['access_token']}"}
    assert client.get("/api/v1/auth/me", headers=new_headers).status_code == 200
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": result["access_token"]}).status_code == 401
    assert client.post("/api/v1/auth/logout", headers=headers).status_code == 200
    # Logout is intentionally stateless: the client discards both tokens;
    # the signed access token remains usable until its short expiry.
    assert client.get("/api/v1/auth/me", headers=headers).status_code == 200


def test_farm_and_field_ownership_and_area_validation(client):
    _, owner_headers = register_user(client, "owner@example.com")
    _, other_headers = register_user(client, "other@example.com")
    farm = make_farm(client, owner_headers)
    field = make_field(client, owner_headers, farm)

    assert client.get("/api/v1/farms", headers=owner_headers).json()[0]["id"] == farm["id"]
    assert client.get("/api/v1/farms", headers=other_headers).json() == []
    assert client.get(f"/api/v1/farms/{farm['id']}", headers=other_headers).status_code == 404
    assert client.get(f"/api/v1/fields/{field['id']}", headers=other_headers).status_code == 404
    empty_summary = client.get(f"/api/v1/analytics/field/{field['id']}/summary?period=7d", headers=owner_headers)
    assert empty_summary.status_code == 200
    assert empty_summary.json()["number_of_readings"] == 0
    assert empty_summary.json()["average_moisture"] is None
    assert client.get("/api/v1/sensors/not-a-sensor", headers=owner_headers).status_code == 404
    too_large = client.post(
        f"/api/v1/farms/{farm['id']}/fields",
        headers=owner_headers,
        json={"field_name": "Too Large", "crop_type": "rice", "soil_type": "Clay", "area": 10, "area_unit": "Acres"},
    )
    assert too_large.status_code == 422
    assert client.get(f"/api/v1/farms/not-a-farm", headers=owner_headers).status_code == 404


def test_sensor_ingestion_validation_analytics_and_recommendation(client):
    _, headers = register_user(client)
    farm = make_farm(client, headers)
    field = make_field(client, headers, farm)
    created_sensor = client.post(
        "/api/v1/sensors",
        headers=headers,
        json={"sensor_code": "TEST-SENSOR-1", "farm_id": farm["id"], "field_id": field["id"]},
    )
    assert created_sensor.status_code == 201, created_sensor.text
    sensor = created_sensor.json()
    assert client.get("/api/v1/sensors", headers=headers).json()[0]["id"] == sensor["id"]
    other_field = make_field(client, headers, farm)
    other_sensor_response = client.post(
        "/api/v1/sensors", headers=headers,
        json={"sensor_code": "TEST-SENSOR-OTHER-FIELD", "farm_id": farm["id"], "field_id": other_field["id"]},
    )
    assert other_sensor_response.status_code == 201, other_sensor_response.text
    other_sensor = other_sensor_response.json()

    now = datetime.now(timezone.utc).replace(microsecond=0)
    for timestamp, moisture in ((now - timedelta(hours=6), 47), (now, 43)):
        response = client.post(
            "/api/v1/ingestion/readings",
            headers=headers,
            json={
                "sensor_code": sensor["sensor_code"],
                "sensor_id": sensor["id"],
                "farm_id": farm["id"],
                "field_id": field["id"],
                "soil_moisture": moisture,
                "temperature": 68,
                "temperature_unit": "F",
                "humidity": 65,
                "rainfall": 0,
                "timestamp": timestamp.isoformat(),
                "source": "synthetic_demo",
            },
        )
        assert response.status_code == 201, response.text
        assert response.json()["sensor_id"] == sensor["id"]
        assert response.json()["farm_id"] == farm["id"]
        assert response.json()["field_id"] == field["id"]

    wrong_relationship = client.post(
        "/api/v1/ingestion/readings", headers=headers,
        json={"sensor_code": sensor["sensor_code"], "sensor_id": sensor["id"], "farm_id": farm["id"],
              "field_id": other_field["id"], "soil_moisture": 65,
              "timestamp": (now + timedelta(seconds=1)).isoformat()},
    )
    assert wrong_relationship.status_code == 422

    duplicate = client.post(
        "/api/v1/ingestion/readings",
        headers=headers,
        json={"sensor_code": sensor["sensor_code"], "soil_moisture": 43, "timestamp": now.isoformat()},
    )
    assert duplicate.status_code == 422
    invalid = client.post(
        "/api/v1/ingestion/readings",
        headers=headers,
        json={"sensor_code": sensor["sensor_code"], "soil_moisture": 140, "timestamp": (now + timedelta(seconds=1)).isoformat()},
    )
    assert invalid.status_code == 422

    history = client.get(f"/api/v1/analytics/sensors/{sensor['id']}/history", headers=headers)
    assert history.status_code == 200 and len(history.json()) == 2
    assert all(item["sensor_id"] == sensor["id"] and item["field_id"] == field["id"] and item["farm_id"] == farm["id"] for item in history.json())
    other_history = client.get(f"/api/v1/analytics/sensors/{other_sensor['id']}/history", headers=headers)
    assert other_history.status_code == 200 and other_history.json() == []
    assert history.json()[0]["temperature"] == 20
    assert client.get(
        f"/api/v1/analytics/sensors/{sensor['id']}/history?from_at=2026-11-14T10:00:00", headers=headers
    ).status_code == 422
    assert client.get(
        f"/api/v1/analytics/moisture/{field['id']}?from_at=2026-11-14T12:00:00Z&to_at=2026-11-14T10:00:00Z",
        headers=headers,
    ).status_code == 422
    summary = client.get(f"/api/v1/analytics/field/{field['id']}/summary?period=7d", headers=headers)
    assert summary.status_code == 200 and summary.json()["number_of_readings"] == 2
    metric = client.get(f"/api/v1/analytics/moisture/{field['id']}?period=7d", headers=headers)
    assert metric.status_code == 200 and metric.json()["count"] == 2
    advice = client.get(f"/api/v1/irrigation/recommendation/{field['id']}", headers=headers)
    assert advice.status_code == 200
    assert advice.json()["advisory_only"] is True
    assert advice.json()["predicted_moisture_percent"] == 39
    assert advice.json()["irrigation_recommended"] is True


def test_sensor_and_field_operations_check_ownership(client):
    _, owner_headers = register_user(client, "sensor-owner@example.com")
    _, other_headers = register_user(client, "sensor-other@example.com")
    farm = make_farm(client, owner_headers)
    field = make_field(client, owner_headers, farm)
    sensor = client.post(
        "/api/v1/sensors",
        headers=owner_headers,
        json={"sensor_code": "OWNED-SENSOR", "farm_id": farm["id"], "field_id": field["id"]},
    ).json()
    assert client.get(f"/api/v1/sensors/{sensor['id']}", headers=other_headers).status_code == 404
    assert client.get(f"/api/v1/fields/{field['id']}/sensors", headers=other_headers).status_code == 404
    assert client.put(
        f"/api/v1/sensors/{sensor['id']}",
        headers=other_headers,
        json={"sensor_code": "OWNED-SENSOR", "farm_id": farm["id"], "field_id": field["id"]},
    ).status_code == 404
    assert client.delete(f"/api/v1/sensors/{sensor['id']}", headers=other_headers).status_code == 404
    updated_sensor = client.put(
        f"/api/v1/sensors/{sensor['id']}",
        headers=owner_headers,
        json={"sensor_code": "OWNED-SENSOR", "farm_id": farm["id"], "field_id": field["id"], "sensor_name": "Updated"},
    )
    assert updated_sensor.status_code == 200 and updated_sensor.json()["sensor_name"] == "Updated"
    assert client.delete(f"/api/v1/sensors/{sensor['id']}", headers=owner_headers).status_code == 204
    assert client.get(f"/api/v1/sensors/{sensor['id']}", headers=owner_headers).status_code == 404


def test_farm_field_and_schedule_mutations_are_owner_scoped(client):
    _, owner_headers = register_user(client, "crud-owner@example.com")
    _, other_headers = register_user(client, "crud-other@example.com")
    farm = make_farm(client, owner_headers)
    field = make_field(client, owner_headers, farm)
    assert client.put(
        f"/api/v1/farms/{farm['id']}", headers=other_headers,
        json={"farm_name": "Changed", "total_area": 5, "area_unit": "Acres"},
    ).status_code == 404
    assert client.delete(f"/api/v1/farms/{farm['id']}", headers=other_headers).status_code == 404
    updated_farm = client.put(
        f"/api/v1/farms/{farm['id']}", headers=owner_headers,
        json={"farm_name": "Updated Farm", "total_area": 5, "area_unit": "Acres"},
    )
    assert updated_farm.status_code == 200

    assert client.put(
        f"/api/v1/fields/{field['id']}", headers=other_headers,
        json={"field_name": "Changed", "crop_type": "tomato", "soil_type": "Loamy", "area": 2, "area_unit": "Acres"},
    ).status_code == 404
    schedule = client.post(
        f"/api/v1/irrigation/{field['id']}/schedules", headers=owner_headers,
        json={"start_at": datetime.now(timezone.utc).isoformat(), "duration_minutes": 30},
    ).json()
    update_body = {"mode": "manual", "start_at": datetime.now(timezone.utc).isoformat(), "duration_minutes": 45}
    assert client.put(f"/api/v1/irrigation/schedules/{schedule['id']}", headers=other_headers, json=update_body).status_code == 404
    assert client.delete(f"/api/v1/irrigation/schedules/{schedule['id']}", headers=other_headers).status_code == 404
    assert client.put(f"/api/v1/irrigation/schedules/{schedule['id']}", headers=owner_headers, json=update_body).status_code == 200
    assert client.delete(f"/api/v1/irrigation/schedules/{schedule['id']}", headers=owner_headers).status_code == 204
    assert client.delete(f"/api/v1/fields/{field['id']}", headers=owner_headers).status_code == 204
    assert client.get(f"/api/v1/fields/{field['id']}", headers=owner_headers).status_code == 404
    assert client.delete(f"/api/v1/farms/{farm['id']}", headers=owner_headers).status_code == 204
    assert client.get(f"/api/v1/farms/{farm['id']}", headers=owner_headers).status_code == 404


def test_irrigation_event_default_timestamp_schedule_and_weather_fallback(client, monkeypatch):
    from app.main import settings

    _, headers = register_user(client)
    farm = make_farm(client, headers)
    field = make_field(client, headers, farm)
    event = client.post(f"/api/v1/irrigation/{field['id']}/events", headers=headers, json={"source": "manual"})
    assert event.status_code == 201, event.text
    assert event.json()["event"]["start_at"]
    assert event.json()["hardware_control"] is False
    bad_event = client.post(
        f"/api/v1/irrigation/{field['id']}/events", headers=headers,
        json={"start_at": "2026-11-14T12:00:00Z", "end_at": "2026-11-14T11:00:00Z"},
    )
    assert bad_event.status_code == 422

    no_timezone = client.post(
        f"/api/v1/irrigation/{field['id']}/schedules",
        headers=headers,
        json={"start_at": "2026-11-14T10:00:00", "duration_minutes": 30},
    )
    assert no_timezone.status_code == 422
    schedule = client.post(
        f"/api/v1/irrigation/{field['id']}/schedules",
        headers=headers,
        json={"start_at": datetime.now(timezone.utc).isoformat(), "duration_minutes": 30},
    )
    assert schedule.status_code == 201
    assert client.get(f"/api/v1/irrigation/{field['id']}/schedules", headers=headers).json()[0]["id"] == schedule.json()["id"]

    monkeypatch.setattr(settings, "weather_provider", "disabled")
    weather = client.get(f"/api/v1/weather/current?farm_id={farm['id']}", headers=headers)
    assert weather.status_code == 503
    assert "cached snapshot" in weather.json()["detail"]
