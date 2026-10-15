using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BurgerCravvy.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    private static string Img(string id) =>
        $"https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=800&q=75";

    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Productos");
        b.HasKey(p => p.Id);
        b.HasIndex(p => p.Slug).IsUnique();
        b.Property(p => p.Slug).HasMaxLength(60).IsRequired();
        b.Property(p => p.Name).HasMaxLength(80).IsRequired();
        b.Property(p => p.Description).HasMaxLength(300);
        b.Property(p => p.Price).HasPrecision(10, 2);
        b.Property(p => p.ImageUrl).HasMaxLength(500);
        b.Property(p => p.ImageAlt).HasMaxLength(200);
        b.Property(p => p.Badge).HasConversion<string>().HasMaxLength(20);

        // Datos semilla del menú (los mismos que muestra la web).
        b.HasData(
            new
            {
                Id = 1, Slug = "classic-cravvy", Name = "Classic Cravvy",
                Description = "Carne jugosa, queso fundido y todos los clásicos.",
                Price = 8.99m, ImageUrl = Img("1571091718767-18b5b1457add"),
                ImageAlt = "Hamburguesa clásica con queso, lechuga, tomate y pan brioche con sésamo",
                Badge = ProductBadge.Sticker, IsFavorite = true, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 2, Slug = "double-trouble", Name = "Double Trouble",
                Description = "El doble de sabor, el doble de felicidad.",
                Price = 11.99m, ImageUrl = Img("1553979459-d2229ba7433b"),
                ImageAlt = "Hamburguesa doble de carne con queso fundido",
                Badge = ProductBadge.Heart, IsFavorite = true, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 3, Slug = "golden-fries", Name = "Papas Doradas",
                Description = "Doradas, crujientes e imposibles de compartir.",
                Price = 4.99m, ImageUrl = Img("1573080496219-bb080dd4f877"),
                ImageAlt = "Papas fritas doradas y crujientes en una cesta con papel",
                Badge = ProductBadge.Fries, IsFavorite = true, IsAvailable = true, IsArchived = false
            });
    }
}
