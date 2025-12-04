from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from ..extensions import db
from ..models import User
from ..schemas import LoginSchema, UserSchema
from ..services.auth_service import authenticate, create_user

bp = Blueprint("auth", __name__)

user_schema = UserSchema()
login_schema = LoginSchema()


@bp.post("/register")
def register_user():
    payload = request.get_json() or {}
    errors = user_schema.validate(payload)
    password = payload.get("password")

    if errors or not password:
        return (
            jsonify(
                {
                    "message": "Invalid payload",
                    "errors": errors or {"password": ["Missing."]},
                }
            ),
            400,
        )

    if User.query.filter_by(email=payload["email"]).first():
        return jsonify({"message": "E-mail already registered"}), 409

    user = create_user(
        email=payload["email"],
        name=payload["name"],
        password=password,
        is_admin=payload.get("is_admin", True),
        role=payload.get("role", "admin"),
    )
    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user_schema.dump(user)}), 201


@bp.post("/login")
def login():
    payload = request.get_json() or {}
    errors = login_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid credentials", "errors": errors}), 400

    user = authenticate(payload["email"], payload["password"])
    if not user:
        return jsonify({"message": "Invalid e-mail or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user_schema.dump(user)})


@bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user_schema.dump(user))
