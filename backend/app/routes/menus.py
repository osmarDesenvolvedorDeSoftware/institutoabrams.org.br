from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..schemas import MenuSchema, PageSchema
from ..services import menu_service, page_service

bp = Blueprint("menus", __name__)

menu_schema = MenuSchema()
page_schema = PageSchema()


@bp.get("")
def list_menus():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    parent_id = request.args.get("parent_id", type=int)
    data = menu_service.list_menus(page=page, per_page=per_page, parent_id=parent_id)
    return jsonify(
        {"items": menu_schema.dump(data["items"], many=True), "meta": data["meta"]}
    )


@bp.delete("/<int:menu_id>")
@jwt_required()
def delete_menu(menu_id: int):
    menu = menu_service.get_menu(menu_id)
    if not menu:
        return jsonify({"message": "Menu not found"}), 404
    menu_service.delete_menu(menu)
    return jsonify({"message": "Deleted"}), 204


@bp.patch("/<int:menu_id>")
@jwt_required()
def update_menu(menu_id: int):
    menu = menu_service.get_menu(menu_id)
    if not menu:
        return jsonify({"message": "Menu not found"}), 404

    payload = request.get_json() or {}
    parent_id = payload.get("parent_id", menu.parent_id)
    if parent_id is not None:
        parent = menu_service.get_menu(parent_id)
        if not parent:
            return jsonify({"message": "Parent menu not found"}), 404
    try:
        updated = menu_service.update_menu(menu, payload)
    except ValueError as err:
        return jsonify({"message": str(err)}), 400
    return jsonify(menu_schema.dump(updated)), 200


@bp.post("/<int:menu_id>/add-submenu")
@jwt_required()
def add_submenu(menu_id: int):
    parent = menu_service.get_menu(menu_id)
    if not parent:
        return jsonify({"message": "Parent menu not found"}), 404

    payload = request.get_json() or {}
    use_existing_page_id = payload.get("use_existing_page_id")
    page_data = payload.get("page") or {}

    page = None
    if use_existing_page_id is not None:
        page = page_service.get_page(use_existing_page_id)
        if not page:
            return jsonify({"message": "Page not found"}), 404
        if page.slug == "home-content":
            return jsonify({"message": "home-content cannot be added to menus"}), 400
    elif page_data:
        try:
            loaded_page = page_schema.load(page_data)
        except ValidationError as err:
            return jsonify({"message": "Invalid payload", "errors": err.messages}), 400
        try:
            page = page_service.create_page_in_session(loaded_page, commit=True)
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "Slug conflict creating page"}), 409
        except ValueError as err:
            db.session.rollback()
            return jsonify({"message": str(err)}), 400
        if page.slug == "home-content":
            db.session.rollback()
            return jsonify({"message": "home-content cannot be added to menus"}), 400
    else:
        return jsonify({"message": "Invalid payload"}), 400

    menu_payload = {
        "label": (page.title_translations or {}).get("pt") or page.slug,
        "slug": page.slug,
        "target": menu_service.normalize_target(page.slug),
        "parent_id": menu_id,
        "order": payload.get("order"),
    }

    try:
        menu = menu_service.create_menu_with_defaults(menu_payload)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Slug conflict creating menu"}), 409
    except ValueError as err:
        db.session.rollback()
        return jsonify({"message": str(err)}), 400

    if not parent.is_dropdown:
        parent.is_dropdown = True
        db.session.commit()

    parent = menu_service.get_menu(menu_id)

    return (
        jsonify(
            {
                "parent": menu_schema.dump(parent),
                "page": page_schema.dump(page),
                "menu": menu_schema.dump(menu),
            }
        ),
        201,
    )
