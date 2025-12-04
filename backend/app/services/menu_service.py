from typing import Dict, Optional

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


def create_menu(payload: dict) -> Menu:
    menu = Menu(**payload)
    db.session.add(menu)
    db.session.commit()
    return menu


def update_menu(menu: Menu, payload: dict) -> Menu:
    for key, value in payload.items():
        setattr(menu, key, value)
    db.session.commit()
    return menu


def delete_menu(menu: Menu) -> None:
    db.session.delete(menu)
    db.session.commit()
