from .services.auth_service import create_user


def seed_admin():
    """Seed a default admin user for development (idempotent)."""
    from .models import User  # imported here to avoid circular deps

    email = "admin@abrams.org"
    if User.query.filter_by(email=email).first():
        return "Admin already exists"

    create_user(email=email, name="Admin", password="admin123", is_admin=True)
    return "Admin created"
