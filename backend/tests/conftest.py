"""Isolated API tests use an in-memory SQLite database, never the demo DB."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import Base, app, get_db


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        with TestSession() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def register_user(client: TestClient, email: str = "farmer@example.com"):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Farmer",
            "email": email,
            "mobile_number": "1234567890",
            "password": "TestPassword@2026",
            "preferred_language": "en",
        },
    )
    assert response.status_code == 201, response.text
    result = response.json()
    return result, {"Authorization": f"Bearer {result['access_token']}"}
