using Npgsql;

namespace Accounting.BackOffice.Data;

public static class NeonConnectionString
{
    public static string FromUrl(string databaseUrl)
    {
        if (!Uri.TryCreate(databaseUrl, UriKind.Absolute, out var uri)
            || (uri.Scheme != "postgres" && uri.Scheme != "postgresql")
            || string.IsNullOrWhiteSpace(uri.Host))
        {
            throw new InvalidOperationException("DATABASE_URL must be a valid PostgreSQL URL.");
        }

        var credentials = uri.UserInfo.Split(':', 2);
        var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
        if (credentials.Length != 2 || string.IsNullOrWhiteSpace(credentials[0])
            || string.IsNullOrWhiteSpace(credentials[1]) || string.IsNullOrWhiteSpace(database))
        {
            throw new InvalidOperationException("DATABASE_URL must include a username, password, and database.");
        }

        // Build safely even when credentials contain connection-string punctuation.
        // Neon connections always verify the TLS certificate and server hostname.
        var connection = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = database,
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = Uri.UnescapeDataString(credentials[1]),
            SslMode = SslMode.VerifyFull,
            ChannelBinding = ChannelBinding.Require,
        };

        return connection.ConnectionString;
    }
}
