namespace BurgerCravvy.Application.Exceptions;

public class ValidationException(IDictionary<string, string[]> errors)
    : Exception("Uno o más datos no son válidos.")
{
    public IDictionary<string, string[]> Errors { get; } = errors;
}
