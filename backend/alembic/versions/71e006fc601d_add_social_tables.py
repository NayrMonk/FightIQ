"""add social tables

Revision ID: 71e006fc601d
Revises: 2e8e9862130d
Create Date: 2026-08-10 00:47:44.320931

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '71e006fc601d'
down_revision: Union[str, None] = '2e8e9862130d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('activity_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('event_type', sa.String(length=30), nullable=False),
    sa.Column('payload', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_events_created_at'), 'activity_events', ['created_at'], unique=False)
    op.create_index(op.f('ix_activity_events_user_id'), 'activity_events', ['user_id'], unique=False)
    op.create_table('challenges',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('creator_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.Column('description', sa.String(length=500), nullable=True),
    sa.Column('metric', sa.String(length=30), nullable=False),
    sa.Column('target_value', sa.Integer(), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('follows',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('follower_id', sa.Integer(), nullable=False),
    sa.Column('followee_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['followee_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['follower_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('follower_id', 'followee_id', name='uq_follow_pair')
    )
    op.create_index(op.f('ix_follows_followee_id'), 'follows', ['followee_id'], unique=False)
    op.create_index(op.f('ix_follows_follower_id'), 'follows', ['follower_id'], unique=False)
    op.create_table('challenge_participants',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('challenge_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('challenge_id', 'user_id', name='uq_challenge_participant')
    )
    op.create_index(op.f('ix_challenge_participants_challenge_id'), 'challenge_participants', ['challenge_id'], unique=False)
    op.create_index(op.f('ix_challenge_participants_user_id'), 'challenge_participants', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_challenge_participants_user_id'), table_name='challenge_participants')
    op.drop_index(op.f('ix_challenge_participants_challenge_id'), table_name='challenge_participants')
    op.drop_table('challenge_participants')
    op.drop_index(op.f('ix_follows_follower_id'), table_name='follows')
    op.drop_index(op.f('ix_follows_followee_id'), table_name='follows')
    op.drop_table('follows')
    op.drop_table('challenges')
    op.drop_index(op.f('ix_activity_events_user_id'), table_name='activity_events')
    op.drop_index(op.f('ix_activity_events_created_at'), table_name='activity_events')
    op.drop_table('activity_events')
