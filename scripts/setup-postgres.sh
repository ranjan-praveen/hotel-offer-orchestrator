#!/bin/sh

set -eu

echo "Waiting for PostgreSQL..."

until nc -z "${POSTGRES_SEEDS}" "${DB_PORT:-5432}"; do
  sleep 1
done

echo "PostgreSQL is ready"

echo "Creating Temporal database..."

temporal-sql-tool \
  --plugin postgres12 \
  --ep "${POSTGRES_SEEDS}" \
  -u "${POSTGRES_USER}" \
  -p "${DB_PORT:-5432}" \
  --db temporal create

echo "Creating Temporal visibility database..."

temporal-sql-tool \
  --plugin postgres12 \
  --ep "${POSTGRES_SEEDS}" \
  -u "${POSTGRES_USER}" \
  -p "${DB_PORT:-5432}" \
  --db temporal_visibility create

echo "Setting up Temporal schema..."

temporal-sql-tool \
  --plugin postgres12 \
  --ep "${POSTGRES_SEEDS}" \
  -u "${POSTGRES_USER}" \
  -p "${DB_PORT:-5432}" \
  --db temporal setup-schema -v 0.0

temporal-sql-tool \
  --plugin postgres12 \
  --ep "${POSTGRES_SEEDS}" \
  -u "${POSTGRES_USER}" \
  -p "${DB_PORT:-5432}" \
  --db temporal update-schema \
  -d /etc/temporal/schema/postgresql/v12/temporal/versioned

echo "Setting up Temporal visibility schema..."

temporal-sql-tool \
  --plugin postgres12 \
  --ep "${POSTGRES_SEEDS}" \
  -u "${POSTGRES_USER}" \
  -p "${DB_PORT:-5432}" \
  --db temporal_visibility setup-schema -v 0.0

temporal-sql-tool \
  --plugin postgres12 \
  --ep "${POSTGRES_SEEDS}" \
  -u "${POSTGRES_USER}" \
  -p "${DB_PORT:-5432}" \
  --db temporal_visibility update-schema \
  -d /etc/temporal/schema/postgresql/v12/visibility/versioned

echo "Temporal PostgreSQL schema setup complete"