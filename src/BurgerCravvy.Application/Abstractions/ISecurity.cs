using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.Abstractions;

public interface IPasswordHasher
{
    string Hash(Employee employee, string password);
    bool Verify(Employee employee, string password);
}

public record AccessToken(string Token, DateTime ExpiresAtUtc);

public interface IJwtTokenGenerator
{
    AccessToken Generate(Employee employee);
}
