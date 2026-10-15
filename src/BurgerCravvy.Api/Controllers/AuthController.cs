using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BurgerCravvy.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService service) : ControllerBase
{
    /// <summary>Inicia sesión de un empleado y devuelve un JWT.</summary>
    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct) =>
        Ok(await service.LoginAsync(request, ct));
}
