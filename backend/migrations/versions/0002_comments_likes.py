"""add comments and page likes

Revision ID: 0002_comments_likes
Revises: 0001_initial
Create Date: 2026-01-02
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_comments_likes"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("pages", sa.Column("likes_count", sa.Integer(), server_default="0"))
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("page_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_approved", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["page_id"], ["pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_comments_page_id", "comments", ["page_id"])


def downgrade():
    op.drop_index("ix_comments_page_id", table_name="comments")
    op.drop_table("comments")
    op.drop_column("pages", "likes_count")
