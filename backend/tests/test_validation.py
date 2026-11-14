from datetime import datetime, timedelta, timezone
import pytest
from pydantic import ValidationError
from app.main import ReadingIn, SensorReading, normalize_reading, project_moisture_six_hours

def reading(**updates):
    data={"sensor_code":"SM-1","soil_moisture":32.5,"temperature":68,"humidity":72,"rainfall":1,"timestamp":datetime.now(timezone.utc).isoformat()}
    data.update(updates)
    return ReadingIn(**data)

def test_normalizes_units_to_celsius_and_mm():
    normalized=normalize_reading(reading(temperature_unit="F",rainfall_unit="in"))
    assert normalized["temperature"] == pytest.approx(20)
    assert normalized["rainfall"] == pytest.approx(25.4)

@pytest.mark.parametrize("field,value",[("soil_moisture",101),("humidity",-1),("rainfall",-0.1)])
def test_rejects_invalid_measurements(field,value):
    with pytest.raises(ValueError): normalize_reading(reading(**{field:value}))

def test_fraction_moisture_requires_explicit_unit():
    assert normalize_reading(reading(soil_moisture=.32,moisture_unit="fraction"))["soil_moisture"] == 32

def test_rejects_timezone_free_timestamp():
    with pytest.raises(ValidationError): reading(timestamp="2026-11-13T10:30:00")

def test_six_hour_moisture_projection_follows_recent_decline():
    start = datetime.now(timezone.utc)
    rows = [
        SensorReading(recorded_at=start, soil_moisture=60),
        SensorReading(recorded_at=start + timedelta(hours=6), soil_moisture=54),
    ]
    assert project_moisture_six_hours(rows) == pytest.approx(48)

def test_six_hour_projection_needs_two_readings():
    assert project_moisture_six_hours([]) is None
