"""Idempotently register the FarmVeda UI demo farms, fields, sensors and readings.

Run from ``backend`` after ``alembic upgrade head`` and
``python scripts/seed_synthetic_demo.py``. Existing entities are matched by
stable ID or natural key; historical readings are never deleted or rewritten.
Generated history is explicitly marked ``synthetic_demo``.
"""
from __future__ import annotations

import math
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import func, select

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import Farm, Field, Sensor, SensorReading, SessionLocal, User


DEMO_EMAIL = "demo@farmveda.com"
READINGS_PER_SENSOR = 48

FARMS = (
    {
        "id": "farm-01",
        "farm_name": "Annapurna Organic Farm",
        "location": "Mandya, Karnataka",
        "village": "Mandya Rural",
        "district": "Mandya",
        "state": "Karnataka",
        "total_area": 8.5,
        "area_unit": "Acres",
        "fields": (
            {
                "id": "field-01",
                "field_name": "North Paddy Block",
                "crop_type": "Rice",
                "soil_type": "Clay",
                "area": 3.5,
                "planting_date": date(2026, 9, 15),
                "irrigation_type": "Flood Irrigation",
                "sensor": {
                    "id": "sensor-01",
                    "sensor_code": "SN-PADDY-01",
                    "sensor_name": "Paddy Root Hydration Probe",
                    "sensor_type": "Soil Moisture Sensor",
                    "installation_date": date(2026, 2, 1),
                    "installation_location": "North plot center, depth 15cm",
                    "status": "active",
                },
                "moisture": (65.0, 0.48, 14.0, 49.0, 78.0),
            },
            {
                "id": "field-02",
                "field_name": "East Sugarcane Plot",
                "crop_type": "Sugarcane",
                "soil_type": "Loamy",
                "area": 3.0,
                "planting_date": date(2026, 7, 20),
                "irrigation_type": "Drip Irrigation",
                "sensor": {
                    "id": "sensor-02",
                    "sensor_code": "SN-CANE-02",
                    "sensor_name": "Cane Drip Telemetry Node",
                    "sensor_type": "Multi-Parameter Sensor",
                    "installation_date": date(2026, 2, 5),
                    "installation_location": "Row 12 drip valve junction",
                    "status": "active",
                },
                "moisture": (54.0, 0.72, 12.0, 32.0, 67.0),
            },
            {
                "id": "field-03",
                "field_name": "Veggie Polyhouse",
                "crop_type": "Tomato",
                "soil_type": "Red Soil",
                "area": 2.0,
                "planting_date": date(2026, 10, 1),
                "irrigation_type": "Drip Irrigation",
                "sensor": {
                    "id": "sensor-03",
                    "sensor_code": "SN-TOMATO-03",
                    "sensor_name": "Polyhouse Microclimate Station",
                    "sensor_type": "Temperature Sensor",
                    "installation_date": date(2026, 3, 10),
                    "installation_location": "Polyhouse canopy height 1.2m",
                    "status": "warning",
                },
                "moisture": (49.0, 0.9, 11.0, 30.0, 61.0),
            },
        ),
    },
    {
        "id": "farm-02",
        "farm_name": "Kaveri Riverfield",
        "location": "Mysuru Rural, Karnataka",
        "village": "Srirangapatna",
        "district": "Mysuru",
        "state": "Karnataka",
        "total_area": 5.0,
        "area_unit": "Acres",
        "fields": (
            {
                "id": "field-04",
                "field_name": "South Wheat Acre",
                "crop_type": "Wheat",
                "soil_type": "Black Soil",
                "area": 5.0,
                "planting_date": date(2026, 10, 15),
                "irrigation_type": "Sprinkler Irrigation",
                "sensor": {
                    "id": "sensor-04",
                    "sensor_code": "SN-WHEAT-04",
                    "sensor_name": "South Acre Weather & Soil Node",
                    "sensor_type": "Soil Moisture Sensor",
                    "installation_date": date(2026, 1, 20),
                    "installation_location": "East field bund boundary",
                    "status": "offline",
                },
                "moisture": (39.0, 0.78, 10.0, 24.0, 52.0),
            },
        ),
    },
)


def get_or_create_farm(db, owner: User, spec: dict) -> tuple[Farm, bool]:
    by_id = db.get(Farm, spec["id"])
    by_name = db.scalar(
        select(Farm).where(Farm.farmer_id == owner.id, Farm.farm_name == spec["farm_name"])
    )
    if by_id and by_id.farmer_id != owner.id:
        raise RuntimeError(f"Stable farm ID {spec['id']} is already owned by another account.")
    if by_id and by_id.farm_name != spec["farm_name"]:
        raise RuntimeError(f"Stable farm ID {spec['id']} is already used by a different farm.")
    if by_id and by_name and by_id.id != by_name.id:
        raise RuntimeError(f"Multiple existing records match farm {spec['farm_name']!r}; no changes made.")
    farm = by_id or by_name
    created = farm is None
    if created:
        farm = Farm(id=spec["id"], farmer_id=owner.id)
        db.add(farm)
    for key in ("farm_name", "location", "village", "district", "state", "total_area", "area_unit"):
        setattr(farm, key, spec[key])
    return farm, created


def get_or_create_field(db, farm: Farm, spec: dict) -> tuple[Field, bool]:
    by_id = db.get(Field, spec["id"])
    by_name = db.scalar(
        select(Field).where(Field.farm_id == farm.id, Field.field_name == spec["field_name"])
    )
    if by_id and by_id.farm_id != farm.id:
        raise RuntimeError(f"Stable field ID {spec['id']} belongs to another farm.")
    if by_id and by_id.field_name != spec["field_name"]:
        raise RuntimeError(f"Stable field ID {spec['id']} is already used by a different field.")
    if by_id and by_name and by_id.id != by_name.id:
        raise RuntimeError(f"Multiple existing records match field {spec['field_name']!r}; no changes made.")
    field = by_id or by_name
    created = field is None
    if created:
        field = Field(id=spec["id"], farm_id=farm.id)
        db.add(field)
    for key in ("field_name", "crop_type", "soil_type", "area", "irrigation_type"):
        setattr(field, key, spec[key])
    field.area_unit = farm.area_unit
    field.planting_date = spec["planting_date"]
    return field, created


def get_or_create_sensor(db, farm: Farm, field: Field, spec: dict) -> tuple[Sensor, bool]:
    by_id = db.get(Sensor, spec["id"])
    by_code = db.scalar(select(Sensor).where(Sensor.sensor_code == spec["sensor_code"]))
    if by_id and by_id.sensor_code != spec["sensor_code"]:
        raise RuntimeError(f"Stable sensor ID {spec['id']} is already used by a different sensor.")
    if by_id and by_code and by_id.id != by_code.id:
        raise RuntimeError(f"Sensor ID/code conflict for {spec['sensor_code']}; no changes made.")
    sensor = by_id or by_code
    created = sensor is None
    if sensor and (sensor.farm_id != farm.id or sensor.field_id != field.id):
        reading_count = db.scalar(
            select(func.count()).select_from(SensorReading).where(SensorReading.sensor_id == sensor.id)
        )
        if reading_count:
            raise RuntimeError(
                f"Sensor {spec['sensor_code']} has history linked to a different field/farm; refusing to move it."
            )
    if created:
        sensor = Sensor(id=spec["id"], farm_id=farm.id, field_id=field.id)
        db.add(sensor)
    sensor.farm_id = farm.id
    sensor.field_id = field.id
    for key in ("sensor_code", "sensor_name", "sensor_type", "installation_date", "installation_location", "status"):
        setattr(sensor, key, spec[key])
    return sensor, created


def add_synthetic_history(db, sensor: Sensor, farm: Farm, field: Field, spec: dict, now: datetime) -> int:
    existing = db.scalar(
        select(func.count()).select_from(SensorReading).where(SensorReading.sensor_id == sensor.id)
    )
    if existing:
        return 0
    base, decline, period, lower, upper = spec["moisture"]
    for step in range(READINGS_PER_SENSOR):
        recorded_at = now - timedelta(hours=6 * (READINGS_PER_SENSOR - 1 - step))
        cycle = step % int(period)
        rain = 7.0 if step > 0 and step % 29 == 0 else 0.0
        irrigated = step > 0 and cycle == 0
        moisture = base - cycle * decline + 2.4 * math.sin(step * 0.63)
        if irrigated:
            moisture = min(upper, base + 5.0 + math.sin(step / 3))
        if rain:
            moisture += 3.5
        moisture = round(max(lower, min(upper, moisture)), 2)
        hour = recorded_at.hour
        temperature = 24.5 + 6.0 * math.sin((hour - 8) * math.pi / 12) + 1.1 * math.sin(step / 6)
        humidity = max(38.0, min(94.0, 80.0 - (temperature - 24.5) * 1.35 + 4.0 * math.sin(step / 5)))
        db.add(
            SensorReading(
                sensor_id=sensor.id,
                farm_id=farm.id,
                field_id=field.id,
                soil_moisture=moisture,
                temperature=round(temperature, 2),
                humidity=round(humidity, 2),
                rainfall=rain,
                irrigation_status=irrigated,
                recorded_at=recorded_at,
                source_timestamp=recorded_at,
                received_at=recorded_at,
                source="synthetic_demo",
                quality_status="synthetic",
            )
        )
    sensor.last_seen = now
    return READINGS_PER_SENSOR


def main() -> None:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    counts = {"farms": 0, "fields": 0, "sensors": 0, "readings": 0}
    with SessionLocal() as db:
        with db.begin():
            owner = db.scalar(select(User).where(User.email == DEMO_EMAIL))
            if not owner:
                raise RuntimeError(
                    "The demo account is missing. Run scripts/seed_synthetic_demo.py first; "
                    "this script never recreates or changes an existing password."
                )
            # Match the owner name shown by the existing UI; do not touch credentials.
            owner.full_name = "Ramesh Patel"
            for farm_spec in FARMS:
                farm, farm_created = get_or_create_farm(db, owner, farm_spec)
                counts["farms"] += int(farm_created)
                for field_spec in farm_spec["fields"]:
                    field, field_created = get_or_create_field(db, farm, field_spec)
                    counts["fields"] += int(field_created)
                    sensor, sensor_created = get_or_create_sensor(db, farm, field, field_spec["sensor"])
                    counts["sensors"] += int(sensor_created)
                    counts["readings"] += add_synthetic_history(db, sensor, farm, field, field_spec, now)

    print(
        "FarmVeda demo registration complete: "
        f"created {counts['farms']} farms, {counts['fields']} fields, "
        f"{counts['sensors']} sensors and {counts['readings']} synthetic readings."
    )
    print("Existing entities and reading histories were retained; generated readings use source=synthetic_demo.")


if __name__ == "__main__":
    main()
