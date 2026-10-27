"""create bookings table

Revision ID: 8f2a1d04b31a
Revises: 7edec3c3ffeb
Create Date: 2026-10-27 12:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f2a1d04b31a'
down_revision: Union[str, Sequence[str], None] = '7edec3c3ffeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('provider_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('scheduled_date', sa.String(length=50), nullable=False),
        sa.Column('time_slot', sa.String(length=100), nullable=False),
        sa.Column('service_address', sa.String(length=300), nullable=False),
        sa.Column('service_note', sa.String(length=1000), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='Pending'),
        sa.Column('total_amount', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['provider_id'], ['providers.id'], ),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bookings_id'), 'bookings', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_bookings_id'), table_name='bookings')
    op.drop_table('bookings')

