using BurgerCravvy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BurgerCravvy.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ToTable("Pedidos");
        b.HasKey(o => o.Id);
        b.HasIndex(o => o.Code).IsUnique();
        b.Property(o => o.Code).HasMaxLength(20).IsRequired();
        b.Property(o => o.CustomerName).HasMaxLength(80).IsRequired();
        b.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        b.Ignore(o => o.Total);

        // Concurrencia optimista: SQL Server cambia este valor en cada UPDATE. Si dos empleados mueven
        // el mismo pedido a la vez, el segundo UPDATE no encuentra la versión que leyó y se rechaza.
        // Es una propiedad "sombra": el Domain no sabe nada de ella.
        b.Property<byte[]>("RowVersion").IsRowVersion();

        b.HasMany(o => o.Items).WithOne().HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(o => o.Items).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> b)
    {
        b.ToTable("PedidoDetalles");
        b.HasKey(i => i.Id);
        b.Property(i => i.ProductName).HasMaxLength(80).IsRequired();
        b.Property(i => i.UnitPrice).HasPrecision(10, 2);
        b.Ignore(i => i.Subtotal);
        b.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}
