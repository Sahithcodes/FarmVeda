"""FarmVeda modular monolith API. Database creation is migration-driven in deployments."""
from __future__ import annotations

import json
import logging
import math
import os
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional
from uuid import uuid4

import httpx
from fastapi import Body, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, Field as PydField, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import (Boolean, Date, DateTime, Float, ForeignKey, Index, Integer,
                        String, Text, UniqueConstraint, create_engine, func, select)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://farmveda:password@localhost:5432/farmveda"
    jwt_secret_key: str = "change_this_secret"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 14
    weather_provider: str = "disabled"
    openweather_api_key: str = ""
    tomorrow_api_key: str = ""
    frontend_origin: str = "http://localhost:3000"
    temperature_min_c: float = -50
    temperature_max_c: float = 70
    moisture_thresholds: str = '{"default":35,"rice":45,"wheat":30,"cotton":30,"maize":35,"sugarcane":40,"tomato":40,"groundnut":30}'
    def thresholds(self) -> dict[str, float]:
        try:
            values = json.loads(self.moisture_thresholds)
            if not isinstance(values, dict):
                return {"default": 35}
            normalized = {
                str(crop).lower(): float(value)
                for crop, value in values.items()
                if isinstance(value, (int, float)) and math.isfinite(value) and 0 <= value <= 100
            }
            return normalized or {"default": 35}
        except (TypeError, ValueError):
            return {"default": 35}

settings = Settings()
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("farmveda")
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase): pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    mobile_number: Mapped[str] = mapped_column(String(32), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    preferred_language: Mapped[str] = mapped_column(String(8), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    farms: Mapped[list[Farm]] = relationship(back_populates="owner", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"
    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid4()))
    farmer_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farm_name: Mapped[str] = mapped_column(String(160))
    location: Mapped[str] = mapped_column(String(255), default="")
    village: Mapped[str] = mapped_column(String(120), default="")
    district: Mapped[str] = mapped_column(String(120), default="")
    state: Mapped[str] = mapped_column(String(120), default="")
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    total_area: Mapped[float] = mapped_column(Float)
    area_unit: Mapped[str] = mapped_column(String(24), default="Acres")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    owner: Mapped[User] = relationship(back_populates="farms")
    fields: Mapped[list[Field]] = relationship(back_populates="farm", cascade="all, delete-orphan")

class Field(Base):
    __tablename__ = "fields"
    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid4()))
    farm_id: Mapped[str] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"), index=True)
    field_name: Mapped[str] = mapped_column(String(160))
    crop_type: Mapped[str] = mapped_column(String(80))
    soil_type: Mapped[str] = mapped_column(String(80))
    area: Mapped[float] = mapped_column(Float)
    area_unit: Mapped[str] = mapped_column(String(24), default="Acres")
    planting_date: Mapped[Optional[date]] = mapped_column(Date)
    irrigation_type: Mapped[str] = mapped_column(String(80), default="Manual Irrigation")
    farm: Mapped[Farm] = relationship(back_populates="fields")
    sensors: Mapped[list[Sensor]] = relationship(back_populates="field", cascade="all, delete-orphan")

class Sensor(Base):
    __tablename__ = "sensors"
    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid4()))
    sensor_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    farm_id: Mapped[str] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"), index=True)
    field_id: Mapped[str] = mapped_column(ForeignKey("fields.id", ondelete="CASCADE"), index=True)
    sensor_name: Mapped[str] = mapped_column(String(120), default="Sensor")
    sensor_type: Mapped[str] = mapped_column(String(80), default="Multi-Parameter")
    installation_date: Mapped[Optional[date]] = mapped_column(Date)
    installation_location: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(24), default="active", index=True)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    field: Mapped[Field] = relationship(back_populates="sensors")
    readings: Mapped[list[SensorReading]] = relationship(back_populates="sensor", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    __table_args__ = (UniqueConstraint("sensor_id", "recorded_at", name="uq_reading_sensor_time"),
                      Index("ix_reading_farm_field_time", "farm_id", "field_id", "recorded_at"))
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sensor_id: Mapped[str] = mapped_column(ForeignKey("sensors.id", ondelete="CASCADE"), index=True)
    farm_id: Mapped[str] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"), index=True)
    field_id: Mapped[str] = mapped_column(ForeignKey("fields.id", ondelete="CASCADE"), index=True)
    soil_moisture: Mapped[Optional[float]] = mapped_column(Float)
    temperature: Mapped[Optional[float]] = mapped_column(Float)
    humidity: Mapped[Optional[float]] = mapped_column(Float)
    rainfall: Mapped[Optional[float]] = mapped_column(Float)
    irrigation_status: Mapped[Optional[bool]] = mapped_column(Boolean)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    source_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    source: Mapped[str] = mapped_column(String(64), default="sensor")
    quality_status: Mapped[str] = mapped_column(String(32), default="valid")
    sensor: Mapped[Sensor] = relationship(back_populates="readings")

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    farm_id: Mapped[str] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"), index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    payload: Mapped[str] = mapped_column(Text)
    provider: Mapped[str] = mapped_column(String(40))

class IrrigationSchedule(Base):
    __tablename__ = "irrigation_schedules"
    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid4()))
    field_id: Mapped[str] = mapped_column(ForeignKey("fields.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(24), default="manual")
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_minutes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="scheduled")

class IrrigationEvent(Base):
    __tablename__ = "irrigation_events"
    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid4()))
    field_id: Mapped[str] = mapped_column(ForeignKey("fields.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(24), default="manual")
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    end_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    water_usage_liters: Mapped[Optional[float]] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(24), default="recorded")
    source: Mapped[str] = mapped_column(String(40), default="manual")

class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid4()))
    field_id: Mapped[str] = mapped_column(ForeignKey("fields.id", ondelete="CASCADE"), index=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    payload: Mapped[str] = mapped_column(Text)

class RegisterIn(BaseModel):
    full_name: str = PydField(min_length=1, max_length=160)
    email: EmailStr
    mobile_number: str = PydField(default="", max_length=32)
    password: str = PydField(min_length=8, max_length=256)
    preferred_language: str = PydField(default="en", min_length=2, max_length=8)

class LoginIn(BaseModel): email: EmailStr; password: str = PydField(min_length=1, max_length=256)
class RefreshIn(BaseModel): refresh_token: str = PydField(min_length=1)
class PublicUser(BaseModel): id: str; full_name: str; email: EmailStr; preferred_language: str
class AuthResponse(BaseModel): user: PublicUser; access_token: str; refresh_token: str; token_type: str = "bearer"
class TokenResponse(BaseModel): access_token: str; refresh_token: str; token_type: str = "bearer"
class LogoutResponse(BaseModel): detail: str
class CurrentUserResponse(PublicUser): pass
class FarmIn(BaseModel):
    farm_name: str = PydField(min_length=1, max_length=160)
    location: str = PydField(default="", max_length=255)
    village: str = PydField(default="", max_length=120)
    district: str = PydField(default="", max_length=120)
    state: str = PydField(default="", max_length=120)
    latitude: Optional[float] = PydField(default=None, ge=-90, le=90)
    longitude: Optional[float] = PydField(default=None, ge=-180, le=180)
    total_area: float = PydField(gt=0, allow_inf_nan=False)
    area_unit: str = PydField(default="Acres", min_length=1, max_length=24)
class FieldIn(BaseModel):
    field_name: str = PydField(min_length=1, max_length=160)
    crop_type: str = PydField(min_length=1, max_length=80)
    soil_type: str = PydField(min_length=1, max_length=80)
    area: float = PydField(gt=0, allow_inf_nan=False)
    area_unit: str = PydField(default="Acres", min_length=1, max_length=24)
    planting_date: Optional[date] = None
    irrigation_type: str = PydField(default="Manual Irrigation", max_length=80)
class SensorIn(BaseModel):
    sensor_code: str = PydField(min_length=1, max_length=100); farm_id: str; field_id: str
    sensor_name: str = PydField(default="Sensor", max_length=120)
    sensor_type: str = PydField(default="Multi-Parameter", max_length=80)
    installation_date: Optional[date] = None
    installation_location: str = PydField(default="", max_length=255)
    status: str = PydField(default="active", min_length=1, max_length=24)
class ReadingIn(BaseModel):
    sensor_code: str = PydField(min_length=1, max_length=100)
    sensor_id: Optional[str] = None
    farm_id: Optional[str] = None
    field_id: Optional[str] = None
    soil_moisture: Optional[float] = None; temperature: Optional[float] = None
    humidity: Optional[float] = None; rainfall: Optional[float] = None
    irrigation_status: Optional[bool] = None; timestamp: datetime
    source: str = PydField(default="sensor", min_length=1, max_length=64); moisture_unit: Optional[str] = None
    temperature_unit: str = "C"; rainfall_unit: str = "mm"
    @field_validator("timestamp")
    @classmethod
    def require_aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None: raise ValueError("timestamp must include a timezone (ISO 8601)")
        return value.astimezone(timezone.utc)
    @field_validator("moisture_unit")
    @classmethod
    def valid_moisture_unit(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in {"percent", "fraction"}: raise ValueError("moisture_unit must be percent or fraction")
        return value
    @field_validator("temperature_unit")
    @classmethod
    def valid_temperature_unit(cls, value: str) -> str:
        if value.upper() not in {"C", "CELSIUS", "F", "FAHRENHEIT"}: raise ValueError("temperature_unit must be C or F")
        return value
    @field_validator("rainfall_unit")
    @classmethod
    def valid_rainfall_unit(cls, value: str) -> str:
        if value.lower() not in {"mm", "millimetre", "millimeter", "in", "inch", "inches"}: raise ValueError("rainfall_unit must be mm or inches")
        return value
def require_utc_datetime(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("timestamp must include a timezone (ISO 8601)")
    return value.astimezone(timezone.utc)

def query_utc_datetime(value: datetime) -> datetime:
    try:
        return require_utc_datetime(value)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

class ScheduleIn(BaseModel):
    mode: str = PydField(default="manual", min_length=1, max_length=24)
    start_at: datetime
    duration_minutes: int = PydField(gt=0, le=1440)
    @field_validator("start_at")
    @classmethod
    def validate_start_at(cls, value: datetime) -> datetime:
        return require_utc_datetime(value)

class EventIn(BaseModel):
    mode: str = PydField(default="manual", min_length=1, max_length=24); start_at: Optional[datetime] = None; end_at: Optional[datetime] = None
    duration_minutes: Optional[int] = PydField(default=None, gt=0); water_usage_liters: Optional[float] = PydField(default=None, ge=0)
    status: str = PydField(default="recorded", min_length=1, max_length=24)
    source: str = PydField(default="manual", min_length=1, max_length=40)
    @field_validator("start_at", "end_at")
    @classmethod
    def validate_event_times(cls, value: Optional[datetime]) -> Optional[datetime]:
        return require_utc_datetime(value) if value is not None else None
    @field_validator("end_at")
    @classmethod
    def validate_event_range(cls, value: Optional[datetime], info) -> Optional[datetime]:
        start = info.data.get("start_at")
        if value is not None and start is not None and value < start:
            raise ValueError("end_at must be at or after start_at")
        return value
class ORM(BaseModel): model_config = ConfigDict(from_attributes=True)
class FarmOut(ORM): id: str; farmer_id: str; farm_name: str; location: str; village: str; district: str; state: str; latitude: Optional[float]; longitude: Optional[float]; total_area: float; area_unit: str; created_at: datetime; updated_at: datetime
class FieldOut(ORM): id: str; farm_id: str; field_name: str; crop_type: str; soil_type: str; area: float; area_unit: str; planting_date: Optional[date]; irrigation_type: str
class SensorOut(ORM): id: str; sensor_code: str; farm_id: str; field_id: str; sensor_name: str; sensor_type: str; installation_date: Optional[date]; installation_location: str; status: str; last_seen: Optional[datetime]; created_at: datetime

pwd = CryptContext(schemes=["argon2"], deprecated="auto")
bearer = HTTPBearer(
    auto_error=False,
    scheme_name="BearerAuth",
    bearerFormat="JWT",
    description="Paste the access_token returned by login. Do not include the 'Bearer ' prefix.",
)
def get_db():
    with SessionLocal() as db: yield db
def token_for(user: User, kind: str = "access") -> str:
    ttl = timedelta(minutes=settings.jwt_access_token_expire_minutes) if kind == "access" else timedelta(days=settings.jwt_refresh_token_expire_days)
    return jwt.encode({"sub": user.id, "type": kind, "exp": datetime.now(timezone.utc)+ttl}, settings.jwt_secret_key, algorithm="HS256")
def current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if not creds: raise HTTPException(401, "Bearer access token required")
    try:
        data = jwt.decode(creds.credentials, settings.jwt_secret_key, algorithms=["HS256"])
        if data.get("type") != "access": raise ValueError("wrong token type")
        user = db.get(User, data.get("sub"))
    except (JWTError, ValueError): user = None
    if not user: raise HTTPException(401, "Invalid or expired access token")
    return user
def owned_farm(db: Session, farm_id: str, user: User) -> Farm:
    obj = db.scalar(select(Farm).where(Farm.id == farm_id, Farm.farmer_id == user.id))
    if not obj: raise HTTPException(404, "Farm not found")
    return obj
def owned_field(db: Session, field_id: str, user: User) -> Field:
    obj = db.scalar(select(Field).join(Farm).where(Field.id == field_id, Farm.farmer_id == user.id))
    if not obj: raise HTTPException(404, "Field not found")
    return obj
def commit(db: Session):
    try: db.commit()
    except Exception:
        db.rollback(); raise

app = FastAPI(title="FarmVeda API", version="1.0.0", description="Farm, sensor, weather and advisory APIs")
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=True, allow_methods=["*"], allow_headers=["Authorization", "Content-Type", "Idempotency-Key"])

@app.get("/health")
def health(): return {"status":"ok"}

@app.post("/api/v1/auth/register", status_code=201, response_model=AuthResponse)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email=data.email.lower()
    if db.scalar(select(User).where(User.email==email)): raise HTTPException(409,"Email is already registered")
    user=User(full_name=data.full_name.strip(),email=email,mobile_number=data.mobile_number,password_hash=pwd.hash(data.password),preferred_language=data.preferred_language)
    db.add(user)
    try:
        commit(db)
    except IntegrityError:
        raise HTTPException(409, "Email is already registered")
    return {"user":{"id":user.id,"full_name":user.full_name,"email":user.email,"preferred_language":user.preferred_language},"access_token":token_for(user),"refresh_token":token_for(user,"refresh"),"token_type":"bearer"}

@app.post("/api/v1/auth/login", response_model=AuthResponse)
def login(data: LoginIn, db: Session=Depends(get_db)):
    user=db.scalar(select(User).where(User.email==data.email.lower()))
    try:
        password_matches = bool(user and pwd.verify(data.password, user.password_hash))
    except (ValueError, TypeError):
        password_matches = False
    if not password_matches: raise HTTPException(401,"Incorrect email or password")
    return {"user":{"id":user.id,"full_name":user.full_name,"email":user.email,"preferred_language":user.preferred_language},"access_token":token_for(user),"refresh_token":token_for(user,"refresh"),"token_type":"bearer"}

@app.get("/api/v1/auth/me", response_model=CurrentUserResponse)
def me(user: User=Depends(current_user)): return {"id":user.id,"full_name":user.full_name,"email":user.email,"preferred_language":user.preferred_language}
@app.post("/api/v1/auth/refresh", response_model=TokenResponse)
def refresh(data: RefreshIn, db: Session=Depends(get_db)):
    try:
        claims=jwt.decode(data.refresh_token,settings.jwt_secret_key,algorithms=["HS256"])
    except JWTError:
        raise HTTPException(401,"Invalid or expired refresh token")
    if claims.get("type")!="refresh" or not isinstance(claims.get("sub"), str):
        raise HTTPException(401,"Invalid or expired refresh token")
    user=db.get(User,claims["sub"])
    if not user: raise HTTPException(401,"Invalid or expired refresh token")
    return {"access_token":token_for(user),"refresh_token":token_for(user,"refresh"),"token_type":"bearer"}
@app.post("/api/v1/auth/logout", response_model=LogoutResponse)
def logout(user: User=Depends(current_user)): return {"detail":"Logged out. Discard the client tokens."}

@app.post("/api/v1/farms",response_model=FarmOut,status_code=201)
def create_farm(data: FarmIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    obj=Farm(**data.model_dump(),farmer_id=user.id); db.add(obj);commit(db);return obj
@app.get("/api/v1/farms",response_model=list[FarmOut])
def list_farms(db:Session=Depends(get_db),user:User=Depends(current_user),limit:int=Query(100,ge=1,le=500),offset:int=Query(0,ge=0)):
    return list(db.scalars(select(Farm).where(Farm.farmer_id==user.id).order_by(Farm.created_at.desc()).offset(offset).limit(limit)))
@app.get("/api/v1/farms/{farm_id}",response_model=FarmOut)
def get_farm(farm_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):return owned_farm(db,farm_id,user)
@app.put("/api/v1/farms/{farm_id}",response_model=FarmOut)
def update_farm(farm_id:str,data:FarmIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    obj=owned_farm(db,farm_id,user)
    used=db.scalar(select(func.coalesce(func.sum(Field.area),0)).where(Field.farm_id==farm_id)) or 0
    if used and data.area_unit!=obj.area_unit: raise HTTPException(409,"Cannot change farm area unit while fields are registered")
    if used>data.total_area: raise HTTPException(409,"Farm area cannot be less than registered field area")
    for k,v in data.model_dump().items():setattr(obj,k,v)
    commit(db);return obj
@app.delete("/api/v1/farms/{farm_id}",status_code=204)
def delete_farm(farm_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):db.delete(owned_farm(db,farm_id,user));commit(db)

@app.post("/api/v1/farms/{farm_id}/fields",response_model=FieldOut,status_code=201)
def create_field(farm_id:str,data:FieldIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    farm=owned_farm(db,farm_id,user)
    if data.area_unit!=farm.area_unit: raise HTTPException(422,"Field and farm area units must match")
    used=db.scalar(select(func.coalesce(func.sum(Field.area),0)).where(Field.farm_id==farm_id)) or 0
    if used+data.area>farm.total_area: raise HTTPException(422,"Registered field area would exceed farm area")
    obj=Field(**data.model_dump(),farm_id=farm_id);db.add(obj);commit(db);return obj
@app.get("/api/v1/farms/{farm_id}/fields",response_model=list[FieldOut])
def list_fields(farm_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_farm(db,farm_id,user);return list(db.scalars(select(Field).where(Field.farm_id==farm_id)))
@app.get("/api/v1/fields/{field_id}",response_model=FieldOut)
def get_field(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):return owned_field(db,field_id,user)
@app.put("/api/v1/fields/{field_id}",response_model=FieldOut)
def update_field(field_id:str,data:FieldIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    obj=owned_field(db,field_id,user);farm=db.get(Farm,obj.farm_id)
    if data.area_unit!=farm.area_unit:raise HTTPException(422,"Field and farm area units must match")
    used=db.scalar(select(func.coalesce(func.sum(Field.area),0)).where(Field.farm_id==farm.id,Field.id!=field_id)) or 0
    if used+data.area>farm.total_area:raise HTTPException(422,"Registered field area would exceed farm area")
    for k,v in data.model_dump().items():setattr(obj,k,v)
    commit(db);return obj
@app.delete("/api/v1/fields/{field_id}",status_code=204)
def delete_field(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):db.delete(owned_field(db,field_id,user));commit(db)

@app.post("/api/v1/sensors",response_model=SensorOut,status_code=201)
def create_sensor(data:SensorIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    farm=owned_farm(db,data.farm_id,user);field=owned_field(db,data.field_id,user)
    if field.farm_id!=farm.id:raise HTTPException(422,"Sensor field must belong to its farm")
    if db.scalar(select(Sensor).where(Sensor.sensor_code==data.sensor_code)):raise HTTPException(409,"Sensor code is already registered")
    obj=Sensor(**data.model_dump());db.add(obj);commit(db);return obj
@app.get("/api/v1/sensors",response_model=list[SensorOut])
def list_sensors(db:Session=Depends(get_db),user:User=Depends(current_user),limit:int=Query(100,ge=1,le=500),offset:int=Query(0,ge=0)):
    return list(db.scalars(select(Sensor).join(Farm).where(Farm.farmer_id==user.id).offset(offset).limit(limit)))
@app.get("/api/v1/fields/{field_id}/sensors",response_model=list[SensorOut])
def field_sensors(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);return list(db.scalars(select(Sensor).where(Sensor.field_id==field_id)))
@app.get("/api/v1/sensors/{sensor_id}",response_model=SensorOut)
def get_sensor(sensor_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    s=db.scalar(select(Sensor).join(Farm).where(Sensor.id==sensor_id,Farm.farmer_id==user.id))
    if not s:raise HTTPException(404,"Sensor not found")
    return s
@app.put("/api/v1/sensors/{sensor_id}",response_model=SensorOut)
def update_sensor(sensor_id:str,data:SensorIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    obj=get_sensor(sensor_id,db,user);owned_farm(db,data.farm_id,user);field=owned_field(db,data.field_id,user)
    if field.farm_id!=data.farm_id:raise HTTPException(422,"Sensor field must belong to its farm")
    for k,v in data.model_dump().items():setattr(obj,k,v)
    commit(db);return obj
@app.delete("/api/v1/sensors/{sensor_id}",status_code=204)
def delete_sensor(sensor_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):db.delete(get_sensor(sensor_id,db,user));commit(db)

def normalize_reading(data:ReadingIn) -> dict[str,Any]:
    vals=data.model_dump(); m=vals["soil_moisture"]
    if m is not None and vals["moisture_unit"]=="fraction":m*=100
    t=vals["temperature"]
    if t is not None and vals["temperature_unit"].upper() in {"F","FAHRENHEIT"}:t=(t-32)*5/9
    rain=vals["rainfall"]
    if rain is not None and vals["rainfall_unit"].lower() in {"in","inch","inches"}:rain*=25.4
    checks=[("soil_moisture",m,0,100),("humidity",vals["humidity"],0,100),("temperature",t,settings.temperature_min_c,settings.temperature_max_c)]
    for name,value,low,high in checks:
        if value is not None and (not math.isfinite(value) or not low<=value<=high):raise ValueError(f"{name} must be between {low} and {high} after unit conversion")
    if rain is not None and (not math.isfinite(rain) or rain<0):raise ValueError("rainfall must be a finite non-negative value")
    stamp=vals["timestamp"].astimezone(timezone.utc)
    if stamp>datetime.now(timezone.utc)+timedelta(minutes=5):raise ValueError("timestamp is too far in the future")
    if not any(vals[k] is not None for k in ("soil_moisture","temperature","humidity","rainfall")):raise ValueError("at least one measurement is required")
    return {"soil_moisture":m,"temperature":t,"humidity":vals["humidity"],"rainfall":rain,"irrigation_status":vals["irrigation_status"],"recorded_at":stamp,"source_timestamp":stamp,"source":vals["source"]}

def ingest_one(data:ReadingIn,db:Session,user:User)->dict[str,Any]:
    sensor_query=select(Sensor).join(Farm).where(Farm.farmer_id==user.id)
    sensor_query=sensor_query.where(Sensor.id==data.sensor_id) if data.sensor_id else sensor_query.where(Sensor.sensor_code==data.sensor_code)
    sensor=db.scalar(sensor_query)
    if not sensor:raise ValueError("sensor_code is not registered to this account")
    if sensor.sensor_code!=data.sensor_code or (data.farm_id is not None and sensor.farm_id!=data.farm_id) or (data.field_id is not None and sensor.field_id!=data.field_id):
        raise ValueError("submitted sensor, farm and field do not match the registered sensor")
    if sensor.status.lower() in {"inactive","disabled"}:raise ValueError("sensor is inactive")
    normalized=normalize_reading(data)
    if db.scalar(select(SensorReading.id).where(SensorReading.sensor_id==sensor.id,SensorReading.recorded_at==normalized["recorded_at"])):raise ValueError("duplicate reading for sensor and timestamp")
    reading=SensorReading(sensor_id=sensor.id,farm_id=sensor.farm_id,field_id=sensor.field_id,**normalized)
    db.add(reading);sensor.last_seen=datetime.now(timezone.utc);db.flush()
    return {"accepted":True,"reading_id":reading.id,"sensor_id":sensor.id,"sensor_code":sensor.sensor_code,"farm_id":sensor.farm_id,"field_id":sensor.field_id,"recorded_at":reading.recorded_at}

@app.post("/api/v1/ingestion/readings",status_code=201)
def ingest(data:ReadingIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    try:result=ingest_one(data,db,user);commit(db);return result
    except ValueError as e:db.rollback();log.warning("Rejected reading %s: %s",data.sensor_code,e);raise HTTPException(422,str(e))
    except IntegrityError as e:
        db.rollback()
        constraint = getattr(getattr(e.orig, "diag", None), "constraint_name", None)
        message = str(e.orig).lower()
        if constraint == "uq_reading_sensor_time" or ("sensor_readings.sensor_id" in message and "recorded_at" in message):
            raise HTTPException(409,"duplicate reading for sensor and timestamp")
        raise
    except Exception as e:
        db.rollback()
        if "uq_reading_sensor_time" in str(e):raise HTTPException(409,"duplicate reading for sensor and timestamp")
        raise
@app.post("/api/v1/ingestion/readings/batch")
def ingest_batch(items:list[ReadingIn]=Body(min_length=1,max_length=500),db:Session=Depends(get_db),user:User=Depends(current_user)):
    accepted=[];rejected=[]
    for i,item in enumerate(items):
        try:
            result=ingest_one(item,db,user);db.commit();accepted.append(result)
        except Exception as e:
            db.rollback();message=str(e.detail if isinstance(e,HTTPException) else e)
            log.warning("Rejected batch reading index=%d sensor=%s: %s",i,item.sensor_code,message)
            rejected.append({"index":i,"sensor_code":item.sensor_code,"error":message})
    return {"accepted":accepted,"rejected":rejected,"accepted_count":len(accepted),"rejected_count":len(rejected),"ingested_at":datetime.now(timezone.utc)}

def field_readings(db:Session,field_id:str,from_at:Optional[datetime],to_at:Optional[datetime],limit:int=1000):
    q=select(SensorReading).where(SensorReading.field_id==field_id)
    if from_at:q=q.where(SensorReading.recorded_at>=from_at)
    if to_at:q=q.where(SensorReading.recorded_at<=to_at)
    return list(db.scalars(q.order_by(SensorReading.recorded_at.desc()).limit(limit)))
def range_args(period:str,from_at:Optional[datetime],to_at:Optional[datetime]):
    now=datetime.now(timezone.utc)
    if from_at or to_at:
        start = query_utc_datetime(from_at) if from_at else datetime.min.replace(tzinfo=timezone.utc)
        end = query_utc_datetime(to_at) if to_at else now
        if end < start: raise HTTPException(422, "to_at must be at or after from_at")
        return start, end
    days={"24h":1,"7d":7,"30d":30}.get(period)
    if not days:raise HTTPException(422,"period must be 24h, 7d, or 30d")
    return now-timedelta(days=days),now

def project_moisture_six_hours(readings: list[SensorReading]) -> Optional[float]:
    """Explainable linear trend projection for the demo; not trained ML."""
    if len(readings) < 2:
        return None
    first_time = readings[0].recorded_at
    xs = [(r.recorded_at - first_time).total_seconds() / 3600 for r in readings]
    ys = [float(r.soil_moisture) for r in readings if r.soil_moisture is not None]
    if len(ys) != len(xs):
        return None
    x_mean = sum(xs) / len(xs)
    y_mean = sum(ys) / len(ys)
    denominator = sum((x - x_mean) ** 2 for x in xs)
    slope = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys)) / denominator if denominator else 0.0
    return max(0.0, min(100.0, ys[-1] + slope * 6))

def as_utc(value: datetime) -> datetime:
    """Normalize DB datetimes; SQLite test rows may come back naive."""
    if value.tzinfo is None or value.utcoffset() is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)
@app.get("/api/v1/analytics/{metric}/{field_id}")
def analytics_metric(metric:str,field_id:str,period:str="7d",from_at:Optional[datetime]=None,to_at:Optional[datetime]=None,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user)
    col={"moisture":SensorReading.soil_moisture,"temperature":SensorReading.temperature,"humidity":SensorReading.humidity}.get(metric)
    if col is None:raise HTTPException(404,"Unknown analytics metric")
    start,end=range_args(period,from_at,to_at)
    rows=db.execute(select(func.avg(col),func.min(col),func.max(col),func.count(col)).where(SensorReading.field_id==field_id,SensorReading.recorded_at>=start,SensorReading.recorded_at<=end)).one()
    points=list(db.execute(select(SensorReading.recorded_at,col).where(SensorReading.field_id==field_id,SensorReading.recorded_at>=start,SensorReading.recorded_at<=end).order_by(SensorReading.recorded_at).limit(2000)))
    return {"field_id":field_id,"metric":metric,"average":rows[0],"minimum":rows[1],"maximum":rows[2],"count":rows[3],"data":[{"timestamp":p[0],"value":p[1]} for p in points]}
@app.get("/api/v1/analytics/sensors/{sensor_id}/history")
def sensor_history(sensor_id:str,from_at:Optional[datetime]=None,to_at:Optional[datetime]=None,limit:int=Query(500,ge=1,le=5000),db:Session=Depends(get_db),user:User=Depends(current_user)):
    sensor=get_sensor(sensor_id,db,user);q=select(SensorReading).where(SensorReading.sensor_id==sensor.id)
    start = query_utc_datetime(from_at) if from_at else None
    end = query_utc_datetime(to_at) if to_at else None
    if start and end and end < start: raise HTTPException(422,"to_at must be at or after from_at")
    if start:q=q.where(SensorReading.recorded_at>=start)
    if end:q=q.where(SensorReading.recorded_at<=end)
    return list(db.scalars(q.order_by(SensorReading.recorded_at.desc()).limit(limit)))
@app.get("/api/v1/analytics/field/{field_id}/summary")
def field_summary(field_id:str,period:str="7d",db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);start,end=range_args(period,None,None)
    row=db.execute(select(func.avg(SensorReading.soil_moisture),func.min(SensorReading.soil_moisture),func.max(SensorReading.soil_moisture),func.avg(SensorReading.temperature),func.avg(SensorReading.humidity),func.sum(SensorReading.rainfall),func.count(SensorReading.id),func.max(SensorReading.recorded_at)).where(SensorReading.field_id==field_id,SensorReading.recorded_at>=start,SensorReading.recorded_at<=end)).one()
    return dict(zip(["average_moisture","minimum_moisture","maximum_moisture","average_temperature","average_humidity","total_rainfall","number_of_readings","last_updated"],row))

async def weather_call(farm:Farm,forecast:bool,days:int=5)->dict[str,Any]:
    provider=settings.weather_provider.lower()
    if farm.latitude is None or farm.longitude is None:raise HTTPException(422,"Farm coordinates are required for weather")
    if provider=="openweathermap":
        if not settings.openweather_api_key:raise HTTPException(503,"OpenWeatherMap API key is not configured")
        endpoint="https://api.openweathermap.org/data/2.5/forecast" if forecast else "https://api.openweathermap.org/data/2.5/weather"
        params={"lat":farm.latitude,"lon":farm.longitude,"appid":settings.openweather_api_key,"units":"metric"}
        if forecast:params["cnt"]=str(min(days*8,40))
    elif provider=="tomorrow":
        if not settings.tomorrow_api_key:raise HTTPException(503,"Tomorrow.io API key is not configured")
        endpoint="https://api.tomorrow.io/v4/weather/forecast" if forecast else "https://api.tomorrow.io/v4/weather/realtime"
        params={"location":f"{farm.latitude},{farm.longitude}","apikey":settings.tomorrow_api_key,"timesteps":"1d" if forecast else "current"}
    else:raise HTTPException(503,"Configured weather provider is unsupported")
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response=await client.get(endpoint,params=params);response.raise_for_status();payload=response.json()
    except httpx.HTTPStatusError as e:
        code=503 if e.response.status_code==429 else 502
        raise HTTPException(code,"Weather provider rate limit or service error")
    except httpx.HTTPError:raise HTTPException(502,"Weather provider is unavailable")
    except (ValueError, json.JSONDecodeError):raise HTTPException(502,"Weather provider returned an invalid response")
    with SessionLocal() as db:
        db.add(WeatherRecord(farm_id=farm.id,observed_at=datetime.now(timezone.utc),payload=json.dumps(payload),provider=provider));db.commit()
    return {"provider":provider,"data_status":"live","data":payload}
async def cached_weather(farm:Farm,db:Session):
    record=db.scalar(select(WeatherRecord).where(WeatherRecord.farm_id==farm.id).order_by(WeatherRecord.observed_at.desc()))
    if record and record.observed_at>=datetime.now(timezone.utc)-timedelta(hours=3):return {"provider":record.provider,"data_status":"cached","observed_at":record.observed_at,"data":json.loads(record.payload)}
    raise HTTPException(503,"Weather is currently unavailable and no recent cached snapshot exists")
@app.get("/api/v1/weather/current")
async def weather_current(farm_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    farm=owned_farm(db,farm_id,user)
    try:return await weather_call(farm,False)
    except HTTPException as e:
        if e.status_code==422:raise
        return await cached_weather(farm,db)
@app.get("/api/v1/weather/forecast")
async def weather_forecast(farm_id:str,days:int=Query(5,ge=1,le=5),db:Session=Depends(get_db),user:User=Depends(current_user)):
    farm=owned_farm(db,farm_id,user)
    try:return await weather_call(farm,True,days)
    except HTTPException as e:
        if e.status_code==422:raise
        return await cached_weather(farm,db)
@app.get("/api/v1/weather/history")
def weather_history(farm_id:str,db:Session=Depends(get_db),user:User=Depends(current_user),limit:int=Query(100,ge=1,le=1000)):
    owned_farm(db,farm_id,user)
    return [{"observed_at":r.observed_at,"provider":r.provider,"data":json.loads(r.payload)} for r in db.scalars(select(WeatherRecord).where(WeatherRecord.farm_id==farm_id).order_by(WeatherRecord.observed_at.desc()).limit(limit))]

@app.get("/api/v1/irrigation/recommendation/{field_id}")
def recommendation(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    field=owned_field(db,field_id,user);now=datetime.now(timezone.utc)
    latest=db.scalar(select(SensorReading).where(SensorReading.field_id==field_id).order_by(SensorReading.recorded_at.desc()))
    recent=list(db.scalars(select(SensorReading).where(SensorReading.field_id==field_id,SensorReading.soil_moisture.is_not(None),SensorReading.recorded_at>=now-timedelta(hours=48)).order_by(SensorReading.recorded_at.asc()).limit(500)))
    projected=project_moisture_six_hours(recent)
    sources={r.source for r in recent}
    data_label=("synthetic_demo_data" if sources and all(s.startswith("synthetic") for s in sources)
                else "mixed_synthetic_and_user_data" if any(s.startswith("synthetic") for s in sources)
                else "user_sensor_data")
    base={"field_id":field_id,"generated_at":now,"method":"crop_threshold_and_6h_moisture_trend","advisory_only":True,"prediction_horizon_hours":6,"predicted_moisture_percent":round(projected,2) if projected is not None else None,"data_label":data_label,"model_disclaimer":"Experimental trend projection for demonstration only; not a trained model or real-world validated prediction."}
    latest_at = as_utc(latest.recorded_at) if latest else None
    if not latest or now-latest_at>timedelta(hours=24) or latest.soil_moisture is None:
        result={**base,"irrigation_recommended":None,"priority":"unknown","current_soil_moisture":latest.soil_moisture if latest else None,"reason":"Recent soil moisture data is insufficient or stale.","weather_consideration":"No reliable current weather assessment.","recommended_action":"Check the sensor and soil moisture before deciding."}
    else:
        thresholds=settings.thresholds();threshold=thresholds.get(field.crop_type.lower(),thresholds.get("default",35))
        rain_recent=db.scalar(select(func.coalesce(func.sum(SensorReading.rainfall),0)).where(SensorReading.field_id==field_id,SensorReading.recorded_at>=now-timedelta(hours=24))) or 0
        current_dry=latest.soil_moisture<threshold
        predicted_dry=projected is not None and projected<threshold
        dry=current_dry or predicted_dry
        delay=dry and rain_recent>=8
        high_temp=latest.temperature is not None and latest.temperature>=35
        result={**base,"irrigation_recommended":bool(dry and not delay),"priority":"high" if dry and not delay else "normal","current_soil_moisture":latest.soil_moisture,"threshold":threshold,"reason":f"{'Current or projected' if predicted_dry and not current_dry else 'Current'} soil moisture is below the configured {field.crop_type} threshold ({threshold}%)." if dry else f"Current and projected moisture are at or above the configured {field.crop_type} threshold ({threshold}%).","weather_consideration":"Recent rainfall suggests delaying irrigation." if delay else "No significant recent rainfall recorded; live forecast is not configured.","recommended_action":"Delay irrigation and monitor soil moisture." if delay else "Consider irrigating the field and review again after watering." if dry else "Irrigation is not currently required.","high_temperature_warning":high_temp,"water_management_note":"Crop-specific moisture thresholds are configurable; recommendation is advisory only."}
    return result
@app.get("/api/v1/irrigation/{field_id}/status")
def irrigation_status(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);latest=db.scalar(select(IrrigationEvent).where(IrrigationEvent.field_id==field_id).order_by(IrrigationEvent.start_at.desc()))
    return {"field_id":field_id,"status":latest.status if latest else "unknown","mode":latest.mode if latest else None,"last_event":latest.start_at if latest else None,"hardware_control":False}
@app.get("/api/v1/irrigation/{field_id}/schedules")
def schedules(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);return list(db.scalars(select(IrrigationSchedule).where(IrrigationSchedule.field_id==field_id).order_by(IrrigationSchedule.start_at)))
@app.post("/api/v1/irrigation/{field_id}/schedules",status_code=201)
def create_schedule(field_id:str,data:ScheduleIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);obj=IrrigationSchedule(field_id=field_id,**data.model_dump());db.add(obj);commit(db);return obj
@app.put("/api/v1/irrigation/schedules/{schedule_id}")
def update_schedule(schedule_id:str,data:ScheduleIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    obj=db.scalar(select(IrrigationSchedule).join(Field).join(Farm).where(IrrigationSchedule.id==schedule_id,Farm.farmer_id==user.id))
    if not obj:raise HTTPException(404,"Schedule not found")
    for k,v in data.model_dump().items():setattr(obj,k,v)
    commit(db);return obj
@app.delete("/api/v1/irrigation/schedules/{schedule_id}",status_code=204)
def delete_schedule(schedule_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    obj=db.scalar(select(IrrigationSchedule).join(Field).join(Farm).where(IrrigationSchedule.id==schedule_id,Farm.farmer_id==user.id))
    if not obj:raise HTTPException(404,"Schedule not found")
    db.delete(obj);commit(db)
@app.get("/api/v1/irrigation/{field_id}/history")
def irrigation_history(field_id:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);return list(db.scalars(select(IrrigationEvent).where(IrrigationEvent.field_id==field_id).order_by(IrrigationEvent.start_at.desc()).limit(500)))
@app.post("/api/v1/irrigation/{field_id}/events",status_code=201)
def irrigation_event(field_id:str,data:EventIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    owned_field(db,field_id,user);obj=IrrigationEvent(field_id=field_id,**data.model_dump(exclude_none=True));db.add(obj);commit(db);return {"event":obj,"hardware_control":False}

@app.on_event("startup")
def startup():
    if settings.jwt_secret_key=="change_this_secret":log.warning("JWT_SECRET_KEY is using the development default; set it in production")
