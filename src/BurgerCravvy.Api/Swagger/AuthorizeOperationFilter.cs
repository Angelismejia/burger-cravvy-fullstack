using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BurgerCravvy.Api.Swagger;

/// <summary>
/// Marca con candado en Swagger solo los endpoints que exigen JWT (los del panel),
/// y documenta sus respuestas 401/403.
/// </summary>
public class AuthorizeOperationFilter : IOperationFilter
{
    public const string SchemeName = "Bearer";

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var attributes = context.MethodInfo.GetCustomAttributes(true)
            .Concat(context.MethodInfo.DeclaringType?.GetCustomAttributes(true) ?? [])
            .ToList();

        var requiresAuth = attributes.OfType<AuthorizeAttribute>().Any()
                           && !attributes.OfType<AllowAnonymousAttribute>().Any();
        if (!requiresAuth) return;

        operation.Responses ??= new OpenApiResponses();
        operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Falta el token o ha caducado" });
        operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Tu rol no tiene permiso" });

        operation.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(SchemeName, context.Document)] = []
            }
        ];
    }
}
