"""add profile onboarding fields and user role

Revision ID: cb849681172b
Revises: 0001
Create Date: 2026-08-10 00:35:05.178732

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'cb849681172b'
down_revision: Union[str, None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('athlete_profiles', sa.Column('primary_goal', sa.String(length=50), nullable=True))
    op.add_column('athlete_profiles', sa.Column('onboarding_completed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('role', sa.String(length=20), server_default='athlete', nullable=False))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'role')
    op.drop_column('athlete_profiles', 'onboarding_completed_at')
    op.drop_column('athlete_profiles', 'primary_goal')
