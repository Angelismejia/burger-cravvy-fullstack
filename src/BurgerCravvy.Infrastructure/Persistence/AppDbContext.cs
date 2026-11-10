using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BurgerCravvy.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    /// <summary>
    /// Si la fila cambió desde que se leyó (su RowVersion ya no coincide), EF no guarda nada y lanza
    /// DbUpdateConcurrencyException. Se traduce a una excepción de Application para que las capas
    /// de arriba no dependan de EF Core.
    /// </summary>
    public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken ct = default)
    {
        try
        {
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("Otra persona cambió este pedido al mismo tiempo. Revisa su estado actual e inténtalo de nuevo.");
        }
    }
}
