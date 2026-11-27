using Accounting.BackOffice.Data;
using Microsoft.EntityFrameworkCore;
using Accounting.BackOffice.Repositories;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var databaseUrl = builder.Configuration["DATABASE_URL"];
if (!string.IsNullOrWhiteSpace(databaseUrl))
{
    connectionString = NeonConnectionString.FromUrl(databaseUrl);
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "DATABASE_URL or ConnectionStrings:DefaultConnection is required. Configure Neon environment variables or development User Secrets.");
}

// Validate syntax without including configuration values in the exception.
try
{
    _ = new NpgsqlConnectionStringBuilder(connectionString);
}
catch (ArgumentException)
{
    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not a valid PostgreSQL connection string.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddScoped<IClientRepository, ClientRepository>();

var app = builder.Build();

// Explicit, read-only connectivity check; never creates schema or applies migrations.
if (args.Contains("--check-database", StringComparer.Ordinal))
{
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var canConnect = await dbContext.Database.CanConnectAsync();
    if (canConnect)
    {
        await dbContext.Database.ExecuteSqlRawAsync("SELECT 1");
        Console.WriteLine("PostgreSQL SELECT 1 succeeded through ApplicationDbContext.");
    }
    Console.WriteLine(canConnect ? "PostgreSQL connection succeeded." : "PostgreSQL connection failed. Check database availability and configuration.");
    Environment.ExitCode = canConnect ? 0 : 1;
    await app.DisposeAsync();
    return;
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
