"""add media fields and new tables

Revision ID: 0004_media_and_visuals
Revises: 0003_pages_category
Create Date: 2025-12-05
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0004_media_and_visuals"
down_revision = "0003_pages_category"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("pages", sa.Column("hero_image_url", sa.String(length=500), nullable=True))
    op.add_column("pages", sa.Column("gallery_urls", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("pages", sa.Column("video_url", sa.String(length=500), nullable=True))

    op.add_column("opportunities", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.add_column("opportunities", sa.Column("video_url", sa.String(length=500), nullable=True))

    op.create_table(
        "banners",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("subtitle", sa.String(length=500), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("link_url", sa.String(length=500), nullable=True),
        sa.Column("order", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("value", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
    )


def downgrade():
    op.drop_table("settings")
    op.drop_table("banners")
    op.drop_column("opportunities", "video_url")
    op.drop_column("opportunities", "image_url")
    op.drop_column("pages", "video_url")
    op.drop_column("pages", "gallery_urls")
    op.drop_column("pages", "hero_image_url")
