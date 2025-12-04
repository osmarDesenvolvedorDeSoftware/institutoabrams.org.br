from flask import Flask, jsonify

from .config import Settings
from .extensions import cors, db, jwt, migrate
from .routes import register_routes
from .seed import seed_admin


def create_app(config_object: type[Settings] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object or Settings)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={
            r"/api/*": {"origins": app.config.get("BACKEND_CORS_ORIGINS")},
            r"/health": {"origins": "*"},
        },
    )

    register_routes(app)

    @app.cli.command("seed-admin")
    def seed_admin_cmd():
        """Seed default admin user (dev only)."""
        result = seed_admin()
        print(result)

    @app.errorhandler(404)
    def not_found(error):  # pragma: no cover - thin wrapper
        return jsonify({"message": "Not found"}), 404

    return app
