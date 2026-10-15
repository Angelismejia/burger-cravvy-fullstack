using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BurgerCravvy.Infrastructure.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    private static readonly OrderStatus[] Active = [OrderStatus.Pending, OrderStatus.Preparing, OrderStatus.Ready];

    public async Task AddAsync(Order order, CancellationToken ct = default) =>
        await db.Orders.AddAsync(order, ct);

    public Task<Order?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        db.Orders.AsNoTracking().Include(o => o.Items).FirstOrDefaultAsync(o => o.Code == code, ct);

    public Task<bool> CodeExistsAsync(string code, CancellationToken ct = default) =>
        db.Orders.AnyAsync(o => o.Code == code, ct);

    public Task<Order?> GetByCodeForUpdateAsync(string code, CancellationToken ct = default) =>
        db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Code == code, ct);

    public async Task<IReadOnlyList<Order>> GetActiveAsync(CancellationToken ct = default) =>
        await db.Orders.AsNoTracking().Include(o => o.Items)
            .Where(o => Active.Contains(o.Status))
            .OrderBy(o => o.CreatedAtUtc)
            .ToListAsync(ct);
}
