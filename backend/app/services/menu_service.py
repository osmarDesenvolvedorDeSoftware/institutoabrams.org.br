from typing import Dict, Optional

from ..utils.slugify import slugify

from ..extensions import db
from ..models import Menu
from ..utils.pagination import paginate


def list_menus(page: int = 1, per_page: int = 20, parent_id: int | None = None) -> Dict:
    query = Menu.query
    if parent_id is not None:
        query = query.filter_by(parent_id=parent_id)
    query = query.order_by(Menu.parent_id.asc().nullsfirst(), Menu.order.asc())
    return paginate(query, page=page, per_page=per_page)


def get_menu(menu_id: int) -> Optional[Menu]:
    return Menu.query.get(menu_id)


def normalize_target(slug: str | None, is_root: bool = False) -> str:
    """Force targets to the /pages/<slug> convention, except for root."""
    if is_root:
        return "/"
    safe_slug = slugify(slug or "pagina")
    return f"/pages/{safe_slug}"


def next_order(parent_id: int | None) -> int:
    max_order = (
        db.session.query(db.func.max(Menu.order))
        .filter(Menu.parent_id == parent_id)
        .scalar()
    )
    return 1 if max_order is None else int(max_order) + 1


def ensure_dropdown(menu_id: int) -> Menu:
    menu = get_menu(menu_id)
    if menu and not menu.is_dropdown:
        menu.is_dropdown = True
        db.session.commit()
    return menu


def create_menu_with_defaults(payload: dict) -> Menu:
    data = {**payload}
    data["slug"] = slugify(data.get("slug") or data.get("label") or "menu")
    if data.get("order") is None:
        data["order"] = next_order(data.get("parent_id"))
    if not data.get("target"):
        data["target"] = normalize_target(data.get("slug"), is_root=data.get("parent_id") is None and data.get("slug") in ("", None))
    else:
        data["target"] = normalize_target(data.get("slug")) if data["target"] != "/" else "/"
    menu = Menu(**data)
    db.session.add(menu)
    db.session.commit()
    return menu


def update_menu(menu: Menu, payload: dict) -> Menu:
    for key, value in payload.items():
        setattr(menu, key, value)
    db.session.commit()
    return menu


def delete_menu(menu: Menu) -> None:
    # Remove filhos antes para evitar erro de integridade
    for child in list(menu.children):
        db.session.delete(child)
    db.session.delete(menu)
    db.session.commit()
