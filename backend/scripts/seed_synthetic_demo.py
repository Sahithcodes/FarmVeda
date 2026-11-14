"""Seed clearly labeled synthetic FarmVeda telemetry for a local demo.

Run after `alembic upgrade head` from the backend directory. Safe to rerun:
it exits without inserting duplicates when the demo account already exists.
"""
from __future__ import annotations

import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import func, select

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import (
    Field,
    Farm,
    IrrigationEvent,
    Sensor,
    SensorReading,
    SessionLocal,
    User,
    pwd,
)


DEMO_EMAIL = "demo@farmveda.com"
DEMO_PASSWORD = "FarmVedaDemo@2026"


def main() -> None:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == DEMO_EMAIL))
        if existing:
            farm = db.scalar(select(Farm).where(Farm.id == "demo-farm-synthetic", Farm.farmer_id == existing.id))
            field = db.scalar(select(Field).where(Field.id == "demo-field-synthetic", Field.farm_id == farm.id)) if farm else None
            sensor = db.scalar(
                select(Sensor).where(
                    Sensor.id == "demo-sensor-synthetic",
                    Sensor.farm_id == farm.id,
                    Sensor.field_id == field.id,
                )
            ) if farm and field else None
            reading_count = db.scalar(
                select(func.count()).select_from(SensorReading).where(
                    SensorReading.sensor_id == sensor.id,
                    SensorReading.field_id == field.id,
                    SensorReading.farm_id == farm.id,
                    SensorReading.source == "synthetic_demo",
                )
            ) if sensor else 0
            event_count = db.scalar(
                select(func.count()).select_from(IrrigationEvent).where(
                    IrrigationEvent.field_id == field.id,
                    IrrigationEvent.source == "synthetic_demo",
                )
            ) if field else 0
            try:
                password_hash_valid = pwd.verify(DEMO_PASSWORD, existing.password_hash)
            except (ValueError, TypeError):
                password_hash_valid = False
            if not (farm and field and sensor and reading_count == 120 and event_count == 8 and password_hash_valid):
                raise RuntimeError("Existing synthetic demo records do not match the expected linked dataset; no records were changed.")
            print("Synthetic demo account and linked dataset already exist and are consistent; no records were changed.")
            return

        user = User(
            full_name="FarmVeda Synthetic Demo",
            email=DEMO_EMAIL,
            mobile_number="0000000000",
            password_hash=pwd.hash(DEMO_PASSWORD),
            preferred_language="en",
        )
        farm = Farm(
            id="demo-farm-synthetic",
            owner=user,
            farm_name="Synthetic Demo Farm",
            location="Demo location, Karnataka",
            village="Demo village",
            district="Demo district",
            state="Karnataka",
            latitude=12.9716,
            longitude=77.5946,
            total_area=5.0,
            area_unit="Acres",
        )
        field = Field(
            id="demo-field-synthetic",
            farm=farm,
            field_name="Synthetic Tomato Field",
            crop_type="tomato",
            soil_type="Loamy",
            area=2.0,
            area_unit="Acres",
            irrigation_type="Drip",
        )
        sensor = Sensor(
            id="demo-sensor-synthetic",
            farm_id=farm.id,
            field=field,
            sensor_code="SYNTH-DEMO-001",
            sensor_name="Synthetic Demo Sensor",
            sensor_type="Multi-Parameter",
            status="active",
        )
        db.add(user)
        db.flush()

        # 30 days of readings every six hours (120 observations). Moisture
        # follows a dry-down cycle with occasional rain and irrigation recovery.
        for step in range(120):
            recorded_at = now - timedelta(hours=6 * (119 - step))
            cycle = step % 16
            moisture = 61.0 - cycle * 1.55 + 2.0 * math.sin(step / 5)
            rain = 0.0
            irrigated = False
            if step % 28 == 0 and step > 0:
                rain = 10.0
                moisture += 7.0
            if cycle == 0 and step > 0:
                irrigated = True
                moisture = 66.0
            hour = recorded_at.hour
            temperature = 24.0 + 8.0 * math.sin((hour - 8) * math.pi / 12) + 1.2 * math.sin(step / 8)
            humidity = max(35.0, min(92.0, 82.0 - (temperature - 24.0) * 1.4 + 3 * math.sin(step / 7)))
            db.add(
                SensorReading(
                    sensor=sensor,
                    farm_id=farm.id,
                    field_id=field.id,
                    soil_moisture=round(max(18.0, min(78.0, moisture)), 2),
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

        # Historical watering records are also explicitly identified as synthetic.
        for days_ago in (2, 5, 8, 12, 16, 20, 24, 28):
            started = now - timedelta(days=days_ago, hours=5)
            db.add(
                IrrigationEvent(
                    field_id=field.id,
                    mode="manual_demo",
                    start_at=started,
                    end_at=started + timedelta(minutes=35),
                    duration_minutes=35,
                    water_usage_liters=180.0,
                    status="recorded",
                    source="synthetic_demo",
                )
            )
        db.commit()

    print("Inserted 120 synthetic sensor readings and 8 synthetic irrigation events.")
    print(f"Demo account email: {DEMO_EMAIL}")
    print("All generated records are labeled source=synthetic_demo; they are not real farm data.")


if __name__ == "__main__":
    main()
