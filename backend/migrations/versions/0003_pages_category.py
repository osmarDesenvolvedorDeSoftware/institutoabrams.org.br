"""add category to pages

Revision ID: 0003_pages_category
Revises: 0002_abram_updates
Create Date: 2025-12-04
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_pages_category"
down_revision = "0002_abram_updates"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("pages", sa.Column("category", sa.String(length=100), nullable=True))


def downgrade():
    op.drop_column("pages", "category")
