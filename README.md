# Accounting.BackOffice

ASP.NET Core MVC on .NET 10, using Entity Framework Core with Npgsql and Neon PostgreSQL. An existing local Postgres.app server can also be used through User Secrets.

## Neon setup and verification

Neon hosts PostgreSQL; the MVC application still runs on a .NET host. The repository is linked locally to project `fancy-tree-00565266`, branch `production`, in organization `org-holy-brook-97378483`. `.neon` records that link locally and is ignored by Git.

Use the existing .NET 10 SDK and Node.js/npm for Neon CLI tooling. The installed CLI's optional skills installer requires Node 22.20.0 or newer (this Mac currently has 22.18.0); the installed Neon plugin already includes its PostgreSQL skill.

```sh
npm ci
npx neon@latest login
npx neon@latest init -y --org-id org-holy-brook-97378483 --project-id fancy-tree-00565266 --branch production --services postgres
npx neon@latest deploy
npm run build
npm run check:database
npm start
```

Complete CLI authentication in the browser on this Mac when prompted. A global `neon` installation can be used instead of `npx neon@latest` if available. Initialization is a one-time setup; if already linked, use `deploy` to reconcile `neon.ts` and refresh the environment variables.

`deploy` pulls `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), and branch metadata into `.env.local`, or `.env` if that file exists. These files contain credentials and are ignored by Git. Do not print or commit their contents. After a pull, restrict access with `chmod 600 .env.local` (or `.env`).

Run `dotnet run` to build and start the application at `http://localhost:5000`. In Development, the app reads `DATABASE_URL` from `.env`, or `.env.local` if `.env` does not exist. An explicitly configured `DATABASE_URL` takes priority. This works without Node or the npm launcher. Stop an existing app instance with Ctrl+C before starting another on the same port.

`npm run build` runs the Release .NET build. `npm start` remains an alternative launcher that loads the CLI-selected env file using Node's built-in env-file support and builds the Release application. Existing process environment variables take priority over the file. Change its URL with `ASPNETCORE_URLS` if needed. Production .NET hosting needs only the injected environment variables and the .NET runtime; local env files are not loaded in Production.

The app reads `DATABASE_URL` before the legacy `ConnectionStrings:DefaultConnection` setting so old local User Secrets cannot silently redirect Neon traffic. `NeonConnectionString` converts the PostgreSQL URL to Npgsql's native connection-string format, safely decodes credentials, and enforces certificate/hostname verification (`SSL Mode=VerifyFull`) and SCRAM channel binding. Npgsql/EF Core remains the database stack; no JavaScript database driver is used. URL query options cannot weaken these TLS settings.

`npm run check:database` uses the same launcher and configuration as the app, resolves `ApplicationDbContext` through DI, opens the connection, and executes read-only `SELECT 1`. It exits unsuccessfully if the connection fails. The command does not create tables or apply migrations. Successful connection verification does not establish that the domain schema has been migrated.

For production, inject `DATABASE_URL` through your hosting platform's secret store. The `DATABASE_URL_UNPOOLED` value is reserved for future explicitly approved migration/admin work; it is not used for web traffic. No migrations run automatically or as part of Neon setup. Review and test migrations on an isolated branch before changing production.

## Optional local PostgreSQL prerequisites

- A stable .NET 10 SDK compatible with `global.json` (verified with 10.0.103).
- Your existing Postgres.app installation with its PostgreSQL server running. Select PostgreSQL 17 if that is the installed server version; do not replace an existing cluster or its data.

Open Postgres.app and start its server. Use the app's Start/Stop controls to manage it without deleting data. The examples below assume port 5432 and the standard application path; substitute your installation path or port if different.

```sh
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
pg_isready -h 127.0.0.1 -p 5432
```

`export` makes the bundled PostgreSQL tools available in the current terminal. `pg_isready` checks server readiness, not application credentials. See the [Postgres.app CLI documentation](https://postgresapp.com/documentation/cli-tools.html) for alternate paths.

## Database and User Secrets

Check for the dedicated development role and database first, using the local Postgres.app administrator (normally your macOS username):

```sh
psql -d postgres -c "SELECT rolname FROM pg_roles WHERE rolname = 'accounting_dev';"
psql -d postgres -c "SELECT datname FROM pg_database WHERE datname = 'accounting_backoffice';"
```

If they do not exist, create the role and a database owned by it. `--pwprompt` asks for a password without placing it in command arguments:

```sh
createuser --pwprompt --no-superuser --no-createdb --no-createrole accounting_dev
createdb --owner=accounting_dev accounting_backoffice
psql -h 127.0.0.1 -U accounting_dev -d accounting_backoffice -W -c "SELECT current_user, current_database();"
```

The dedicated role owns this development database so it can apply migrations, without server-wide administrator rights. Keep existing databases and credentials intact. Keep the server bound to localhost. Postgres.app controls client connection permissions; approve access in its local dialog if prompted. Use password authentication for TCP connections if your existing server configuration requires it; a successful connection to a server configured with `trust` does not verify the supplied password.

Save the matching connection string in .NET User Secrets. They are outside Git but are not encrypted, so use them only for development. Run this command, paste the JSON below with the password substituted, then press Control-D to end input:

```sh
dotnet user-secrets set --project Accounting.BackOffice.csproj
```

```json
{
  "ConnectionStrings:DefaultConnection": "Host=127.0.0.1;Port=5432;Database=accounting_backoffice;Username=accounting_dev;Password=<database-password>;Timeout=5"
}
```

Standard input keeps credentials out of command arguments and shell history. Apply connection-string quoting and JSON escaping if the password contains special characters. Do not put credentials in tracked settings. In Development, `dotnet run` also reads the Neon `DATABASE_URL` from the selected local env file.

User Secrets load in `Development`. The launch profiles used by `dotnet run` already select it. EF commands below explicitly select it. A `DATABASE_URL` in the local env file takes priority over the legacy local PostgreSQL connection string; remove that entry when deliberately switching to local PostgreSQL. For production, inject `ConnectionStrings__DefaultConnection` through the deployment platform's secret store; use a least-privilege role and verified TLS.

## Restore, migrate, and run

From the repository root:

```sh
dotnet restore Accounting.BackOffice.slnx --locked-mode  # Restore the locked package versions
dotnet tool restore                                   # Restore repository-local dotnet-ef
dotnet build Accounting.BackOffice.slnx -c Release --no-restore

dotnet ef migrations list --configuration Release -- --environment Development
dotnet ef database update --configuration Release -- --environment Development

dotnet run --configuration Release -- --check-database # Test the configured DbContext
dotnet run --configuration Release                    # Start MVC at http://localhost:5000
```

The migration history evolves the schema to `Clients`, `MonthlyPayments`, `ClientNotes`, and EF's migration history table. `database update` applies migrations not already recorded in that database. Review new migrations before applying them; do not delete migrations or drop databases to fix a schema mismatch. Application startup never applies migrations.

After future model changes, run `dotnet ef migrations add <DescriptiveName> --output-dir Data/Migrations -- --environment Development`, inspect the generated code, then apply it with `database update`.

## Model rules

- `Client.FullName` is required and limited to 200 characters. Nullable `Phone` and `Email` validate their formats and are limited to 30 and 254 characters.
- `Client.MonthlyFee` and `MonthlyPayment.Amount` validate from 0.01 through 9,999 and store as `numeric(6,2)`. Each obligation stores its own amount.
- The unique `(ClientId, Year, Month)` index permits only one obligation per client and month. `PaidAt` is nullable: null means unpaid; a timestamp means paid.
- `ClientNote.Content` is required. Both notes and monthly payments belong to a client through `ClientId`/`Client` and the corresponding collections.
- EF conventions use `Id` for primary keys and required foreign keys with cascade deletion. Setting `IsActive` to false archives a client without deleting related rows; business workflows are not implemented yet.

Data Annotations support MVC validation and EF column mapping. `[Phone]`, `[EmailAddress]`, and `[Range]` do not automatically validate every `SaveChanges` call. The DbContext uses conventions and Data Annotations without additional Fluent API rules.
