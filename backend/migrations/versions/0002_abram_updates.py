"""Align schema to ABRAMS entities (pages, menus, opportunities, leads, translations, users)

Revision ID: 0002_abram_updates
Revises: 0001_initial
Create Date: 2025-12-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_abram_updates"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    # Pages: move to JSON translations
    op.add_column(
        "pages",
        sa.Column(
            "title_translations",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.add_column(
        "pages",
        sa.Column(
            "content_translations",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.drop_column("pages", "language")
    op.drop_column("pages", "content")
    op.drop_column("pages", "title")

    # Menus: rename path -> target and add dropdown flag
    op.add_column("menus", sa.Column("target", sa.String(length=255), nullable=False, server_default="/"))
    op.add_column(
        "menus",
        sa.Column("is_dropdown", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.drop_column("menus", "path")

    # Opportunities: align fields
    op.add_column(
        "opportunities", sa.Column("institution", sa.String(length=255), nullable=True)
    )
    op.add_column(
        "opportunities", sa.Column("category", sa.String(length=100), nullable=True)
    )
    op.add_column(
        "opportunities", sa.Column("official_link", sa.String(length=500), nullable=True)
    )
    op.drop_column("opportunities", "language")
    op.drop_column("opportunities", "location")
    op.drop_column("opportunities", "summary")
    op.drop_column("opportunities", "published_at")

    # Leads: add phone, interest, opportunity link
    op.add_column("leads", sa.Column("phone", sa.String(length=50), nullable=True))
    op.add_column("leads", sa.Column("interest", sa.String(length=255), nullable=True))
    op.add_column("leads", sa.Column("opportunity_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_leads_opportunity",
        "leads",
        "opportunities",
        ["opportunity_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # Translations: recreate simplified key/text store
    op.drop_table("translations")
    op.create_table(
        "translations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=255), nullable=False),
        sa.Column("texts", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
    )

    # Users: admin flag
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade():
    op.drop_column("users", "is_admin")

    op.drop_table("translations")
    op.create_table(
        "translations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resource_type", sa.String(length=100), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("language_code", sa.String(length=8), nullable=False),
        sa.Column("field", sa.String(length=100), nullable=False),
        sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id", name="translations_pkey"),
        sa.UniqueConstraint(
            "resource_type",
            "resource_id",
            "language_code",
            "field",
            name="uq_translation_resource_field",
        ),
    )

    op.drop_constraint("fk_leads_opportunity", "leads", type_="foreignkey")
    op.drop_column("leads", "opportunity_id")
    op.drop_column("leads", "interest")
    op.drop_column("leads", "phone")

    op.add_column(
        "opportunities",
        sa.Column("published_at", sa.DateTime(), nullable=True),
    )
    op.add_column("opportunities", sa.Column("summary", sa.Text(), nullable=True))
    op.add_column("opportunities", sa.Column("location", sa.String(length=255), nullable=True))
    op.add_column("opportunities", sa.Column("language", sa.String(length=8), nullable=True))
    op.drop_column("opportunities", "official_link")
    op.drop_column("opportunities", "category")
    op.drop_column("opportunities", "institution")

    op.add_column("menus", sa.Column("path", sa.String(length=255), nullable=False))
    op.drop_column("menus", "is_dropdown")
    op.drop_column("menus", "target")

    op.add_column("pages", sa.Column("title", sa.String(length=255), nullable=False))
    op.add_column("pages", sa.Column("content", sa.Text(), nullable=True))
    op.add_column("pages", sa.Column("language", sa.String(length=8), nullable=True))
    op.drop_column("pages", "content_translations")
    op.drop_column("pages", "title_translations")
