import os
import tempfile
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.models import Base
from app.db.session import get_db

# Use a temp file instead of :memory: to avoid SQLite cross-thread issues with TestClient
_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.close(_db_fd)

engine = create_engine(
    f"sqlite:///{_db_path}", connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session", scope="function")
def fixture_db_session():
    """Provides a clean in-memory database session for tests."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session", autouse=True)
def cleanup_temp_db():
    yield
    try:
        os.unlink(_db_path)
    except (PermissionError, FileNotFoundError):
        pass


@pytest.fixture(name="client", scope="function")
def fixture_client(db_session):
    """Provides a TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
