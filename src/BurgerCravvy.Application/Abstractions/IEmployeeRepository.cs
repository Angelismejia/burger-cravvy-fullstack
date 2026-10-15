using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.Abstractions;

public interface IEmployeeRepository
{
    Task<Employee?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> AnyAsync(CancellationToken ct = default);
    Task AddAsync(Employee employee, CancellationToken ct = default);
}
