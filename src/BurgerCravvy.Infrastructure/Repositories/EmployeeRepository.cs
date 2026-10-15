using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BurgerCravvy.Infrastructure.Repositories;

public class EmployeeRepository(AppDbContext db) : IEmployeeRepository
{
    public Task<Employee?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Email == email, ct);

    public Task<bool> AnyAsync(CancellationToken ct = default) => db.Employees.AnyAsync(ct);

    public async Task AddAsync(Employee employee, CancellationToken ct = default) =>
        await db.Employees.AddAsync(employee, ct);
}
