import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

// Match the CLI's choice of env file. Existing process variables take priority.
for (const name of [".env", ".env.local"]) {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (existsSync(path)) {
    loadEnvFile(path);
    break;
  }
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is required. Complete Neon sign-in and run npx neon@latest deploy.");
  process.exit(1);
}

const child = spawn("dotnet", [
  "run", "--project", "Accounting.BackOffice.csproj",
  "--configuration", "Release", "--no-launch-profile",
  "--", ...process.argv.slice(2),
], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    ASPNETCORE_ENVIRONMENT: process.env.ASPNETCORE_ENVIRONMENT || process.env.DOTNET_ENVIRONMENT || "Development",
    ASPNETCORE_URLS: process.env.ASPNETCORE_URLS || "http://localhost:5000",
  },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", () => {
  console.error("Could not start dotnet. Check that the .NET 10 SDK is installed.");
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
