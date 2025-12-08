"""add sections to pages

Revision ID: 0005_add_sections
Revises: 0004_media_and_visuals
Create Date: 2025-12-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0005_add_sections"
down_revision = "0004_media_and_visuals"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("pages", sa.Column("sections", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade():
    op.drop_column("pages", "sections")
