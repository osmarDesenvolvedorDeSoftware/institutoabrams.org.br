from flask import Flask

from .auth import bp as auth_bp
from .health import bp as health_bp
from .leads import bp as leads_bp
from .menus import bp as menus_bp
from .opportunities import bp as opportunities_bp
from .pages import bp as pages_bp
from .translations import bp as translations_bp


def register_routes(app: Flask) -> None:
    """Attach all blueprints to the Flask app."""
    prefix = app.config.get("API_PREFIX", "/api/v1")
    app.register_blueprint(health_bp, url_prefix=prefix)
    app.register_blueprint(auth_bp, url_prefix=f"{prefix}/auth")
    app.register_blueprint(pages_bp, url_prefix=f"{prefix}/pages")
    app.register_blueprint(menus_bp, url_prefix=f"{prefix}/menus")
    app.register_blueprint(opportunities_bp, url_prefix=f"{prefix}/opportunities")
    app.register_blueprint(translations_bp, url_prefix=f"{prefix}/translations")
    app.register_blueprint(leads_bp, url_prefix=f"{prefix}/leads")
