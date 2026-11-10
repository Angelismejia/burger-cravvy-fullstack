namespace BurgerCravvy.Application.Exceptions;

/// <summary>Otro usuario cambió los mismos datos a la vez y este cambio llegó tarde (concurrencia optimista).</summary>
public class ConflictException(string message) : Exception(message);
