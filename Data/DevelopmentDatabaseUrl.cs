namespace Accounting.BackOffice.Data;

internal static class DevelopmentDatabaseUrl
{
    public static string? Read(string contentRoot)
    {
        // Match the Neon launcher's file selection; only read the database setting.
        var path = new[] { ".env", ".env.local" }
            .Select(name => Path.Combine(contentRoot, name))
            .FirstOrDefault(File.Exists);
        if (path is null)
        {
            return null;
        }

        foreach (var line in File.ReadLines(path))
        {
            var entry = line.Trim();
            if (entry.StartsWith("export ", StringComparison.Ordinal))
            {
                entry = entry[7..].TrimStart();
            }

            var separator = entry.IndexOf('=');
            if (separator < 0 || entry[..separator].Trim() != "DATABASE_URL")
            {
                continue;
            }

            var value = entry[(separator + 1)..].Trim();
            if (value.Length > 0 && value[0] is '\'' or '"')
            {
                var endQuote = value.IndexOf(value[0], 1);
                if (endQuote < 0)
                {
                    throw new InvalidOperationException("DATABASE_URL in the local env file has an unclosed quote.");
                }

                return value[1..endQuote];
            }

            return value.Split('#', 2)[0].TrimEnd();
        }

        return null;
    }
}
