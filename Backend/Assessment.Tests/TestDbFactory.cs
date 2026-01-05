using Assessment.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Assessment.Tests;

public sealed class TestDbFactory : IDisposable
{
    private readonly SqliteConnection _connection;

    public TestDbFactory()
    {
        
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    public ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .EnableSensitiveDataLogging()
            .Options;

        var db = new ApplicationDbContext(options);
        db.Database.EnsureCreated(); 
        return db;
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }
}