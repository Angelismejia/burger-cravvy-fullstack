using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BurgerCravvy.Infrastructure.Security;

public class JwtTokenGenerator(IOptions<JwtOptions> options) : IJwtTokenGenerator
{
    public AccessToken Generate(Employee employee)
    {
        var o = options.Value;
        var expires = DateTime.UtcNow.AddMinutes(o.ExpirationMinutes);
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(o.Key)), SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, employee.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, employee.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, employee.FullName),
            new Claim(ClaimTypes.Role, employee.Role.ToString()),
        };

        var token = new JwtSecurityToken(o.Issuer, o.Audience, claims, expires: expires, signingCredentials: credentials);
        return new AccessToken(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
