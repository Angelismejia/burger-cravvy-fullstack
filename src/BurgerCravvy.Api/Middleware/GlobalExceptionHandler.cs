using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace BurgerCravvy.Api.Middleware;

/// <summary>Traduce las excepciones de dominio/aplicación a respuestas ProblemDetails.</summary>
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IProblemDetailsService problemDetails)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Datos no válidos"),
            DomainException => (StatusCodes.Status422UnprocessableEntity, "Regla de negocio"),
            NotFoundException => (StatusCodes.Status404NotFound, "No encontrado"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflicto"),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "No autorizado"),
            _ => (StatusCodes.Status500InternalServerError, "Error inesperado")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Error no controlado");

        var details = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status == 500 ? "Algo salió mal en la cocina. Inténtalo de nuevo." : exception.Message
        };
        if (exception is ValidationException v) details.Extensions["errors"] = v.Errors;

        context.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new() { HttpContext = context, ProblemDetails = details, Exception = exception });
    }
}
