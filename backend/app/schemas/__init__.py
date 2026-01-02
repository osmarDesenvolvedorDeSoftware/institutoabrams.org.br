from .banner import BannerSchema
from .lead import LeadSchema
from .menu import MenuSchema
from .opportunity import OpportunitySchema
from .page import PageSchema
from .comment import CommentSchema, CommentCreateSchema
from .setting import SettingSchema
from .translation import TranslationSchema
from .user import LoginSchema, UserSchema

__all__ = [
    "BannerSchema",
    "LeadSchema",
    "LoginSchema",
    "MenuSchema",
    "OpportunitySchema",
    "PageSchema",
    "CommentSchema",
    "CommentCreateSchema",
    "SettingSchema",
    "TranslationSchema",
    "UserSchema",
]
