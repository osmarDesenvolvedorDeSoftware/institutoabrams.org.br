from typing import Optional

from ..extensions import db
from ..models import User


def create_user(
    email: str, name: str, password: str, is_admin: bool = True, role: str = "admin"
) -> User:
    user = User(email=email, name=name, role=role, is_admin=is_admin)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


def authenticate(email: str, password: str) -> Optional[User]:
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password) and user.is_active:
        return user
    return None
