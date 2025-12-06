from typing import Optional

from ..extensions import db
from ..models import Setting


def get_setting(key: str) -> Optional[Setting]:
    return Setting.query.filter_by(key=key).first()


def upsert_setting(key: str, value: dict) -> Setting:
    setting = get_setting(key)
    if setting:
        setting.value = value
    else:
        setting = Setting(key=key, value=value)
        db.session.add(setting)
    db.session.commit()
    return setting
