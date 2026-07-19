from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.config import settings
from app.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

database_url = settings.neon_database_url
config.set_main_option("sqlalchemy.url", database_url)

def include_object(obj, name, type_, reflected, compare_to):
    if type_ == "table" and name in ("venues", "events", "incidents"):
        return False
    return True

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        include_object=include_object,
        literal_binds=False,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if not database_url or context.is_offline_mode():
    config.set_main_option(
        "sqlalchemy.url", database_url or "postgresql://user:pass@localhost/db"
    )
    run_migrations_offline()
else:
    run_migrations_online()
