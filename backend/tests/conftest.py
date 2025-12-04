import pytest

from app import create_app
from app.extensions import db
from app.models import User


class TestSettings:
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "test-secret"
    API_PREFIX = "/api/v1"


@pytest.fixture
def app():
    app = create_app(TestSettings)
    app.config.update(TESTING=True)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_header(app, client):
    with app.app_context():
        user = User(email="tester@example.com", name="Tester", is_admin=True)
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()

    resp = client.post(
        "/api/v1/auth/login", json={"email": "tester@example.com", "password": "password123"}
    )
    token = resp.json["access_token"]
    return {"Authorization": f"Bearer {token}"}
