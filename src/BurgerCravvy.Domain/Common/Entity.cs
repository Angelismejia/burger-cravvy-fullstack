namespace BurgerCravvy.Domain.Common;

/// <summary>Entidad base con identificador.</summary>
public abstract class Entity
{
    public int Id { get; protected set; }
}
