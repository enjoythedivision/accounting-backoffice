# Accounting.BackOffice

ASP.NET Core MVC application targeting .NET 10. This phase configures PostgreSQL and EF Core only; there are no domain entities, migrations, or authentication yet.

## Prerequisites

- A stable .NET 10 SDK compatible with `global.json` (verified with SDK 10.0.103).
- Docker Engine and Docker Compose v2. On this Apple Silicon Mac, follow the [Docker Desktop for Mac installation instructions](https://docs.docker.com/desktop/setup/install/mac-install/), select the Apple Silicon download, install it in Applications, launch it, and finish setup. Wait for the engine to start.

Verify the engine and Compose before continuing:

```sh
docker version
docker compose version
```

## Local database

From the repository root, copy `.env.example` to `.env` if `.env` does not already exist. Replace both placeholders with a development username and a long random password (for example, generate a password with `openssl rand -hex 32`). Restrict file access with `chmod 600 .env`. Keep `.env` out of Git; only `.env.example` is shared.

```sh
docker compose up -d --wait
docker compose ps
docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

The official `postgres:17` image exposes `accounting_backoffice` at `127.0.0.1:5432`. Data persists in a Compose-managed named volume mounted at `/var/lib/postgresql/data`. The health check measures server readiness; the application check below also verifies credentials through EF Core. The major-version image tag receives PostgreSQL 17 maintenance updates; use `docker compose pull` deliberately when updating local infrastructure.

```sh
docker compose stop        # Stop while preserving containers and data
docker compose start      # Restart existing containers
docker compose down       # Remove containers/network; preserve database volume
```

`docker compose down --volumes` permanently deletes local database data. Image initialization variables apply only to a new volume; changing `.env` does not change credentials in an existing database. Rotate existing database credentials explicitly and update User Secrets to match.

## Application configuration

Compose reads `.env` for `POSTGRES_USER` and `POSTGRES_PASSWORD`. ASP.NET Core does not load `.env`. Store the matching connection string in .NET User Secrets, associated with the `UserSecretsId` in the project. User Secrets are outside the repository and are not encrypted; use them only for development.

Run the following command, paste the JSON below with the username and password from `.env`, then press Control-D (macOS/Linux) to end input. Supplying JSON through standard input avoids putting credentials in command arguments or shell history. For passwords containing a semicolon or quote, apply Npgsql connection-string quoting as well as JSON escaping; a generated hexadecimal password avoids this issue.

```sh
dotnet user-secrets set --project Accounting.BackOffice.csproj
```

```json
{
  "ConnectionStrings:DefaultConnection": "Host=127.0.0.1;Port=5432;Database=accounting_backoffice;Username=<local-username>;Password=<local-password>;Timeout=5"
}
```

User Secrets load in the `Development` environment. The default `dotnet run` launch profile sets this environment. Missing or malformed connection configuration fails startup with a message that does not include the supplied value.

For production, inject `ConnectionStrings__DefaultConnection` using the deployment platform's secret store and environment configuration. Use a dedicated least-privilege database role and configure verified TLS (for example, `SSL Mode=VerifyFull` and the appropriate trusted certificate). The Compose initialization role is a local development superuser; this Compose file is not a production database deployment.

## Restore, build, and run

```sh
dotnet restore Accounting.BackOffice.slnx --locked-mode
dotnet tool restore
dotnet ef --version
dotnet build Accounting.BackOffice.slnx --configuration Release --no-restore
dotnet run --project Accounting.BackOffice.csproj --configuration Release --no-build -- --check-database
dotnet run --project Accounting.BackOffice.csproj --configuration Release --no-build
```

Open `http://localhost:5000` using the default HTTP launch profile. For HTTPS, run `dotnet dev-certs https --trust` once and select `--launch-profile https`.

`--check-database` resolves `ApplicationDbContext` from dependency injection, calls `Database.CanConnectAsync()`, and exits with code 0 on success or 1 on failure. It does not start the web server or change the schema. Ordinary application startup does not require an available database; use the explicit check to verify connectivity. Migrations are never applied automatically.

Dependencies are pinned in the project/tool manifest and the resolved NuGet graph is recorded in `packages.lock.json`. Restore with `--locked-mode` for reproducible builds. After intentional package changes, regenerate and review the lock file. Check direct and transitive advisories with:

```sh
dotnet list Accounting.BackOffice.csproj package --vulnerable --include-transitive
```
