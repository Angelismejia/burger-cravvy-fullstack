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
        b.Property(p => p.Category).HasConversion<string>().HasMaxLength(20);

        // Datos semilla del menú (los mismos que muestra la web sin conexión, en fallbackProducts.ts).
        // Los productos añadidos después del lanzamiento usan Id desde 101: en producción el Admin
        // pudo haber creado productos con Id 4, 5…, y repetirlos haría fallar la migración.
        b.HasData(
            new
            {
                Id = 1, Slug = "classic-cravvy", Name = "Classic Cravvy", Category = ProductCategory.Burger,
                Description = "Carne jugosa, queso fundido y todos los clásicos.",
                Price = 450m, ImageUrl = Img("1571091718767-18b5b1457add"),
                ImageAlt = "Hamburguesa clásica con queso, lechuga, tomate y pan brioche con sésamo",
                Badge = ProductBadge.Sticker, IsFavorite = true, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 2, Slug = "double-trouble", Name = "Double Trouble", Category = ProductCategory.Burger,
                Description = "El doble de sabor, el doble de felicidad.",
                Price = 595m, ImageUrl = Img("1553979459-d2229ba7433b"),
                ImageAlt = "Hamburguesa doble de carne con queso fundido",
                Badge = ProductBadge.Heart, IsFavorite = true, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 3, Slug = "golden-fries", Name = "Papas Doradas", Category = ProductCategory.Side,
                Description = "Doradas, crujientes e imposibles de compartir.",
                Price = 225m, ImageUrl = Img("1573080496219-bb080dd4f877"),
                ImageAlt = "Papas fritas doradas y crujientes en una cesta con papel",
                Badge = ProductBadge.Fries, IsFavorite = true, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 101, Slug = "bacon-boom", Name = "Bacon Boom", Category = ProductCategory.Burger,
                Description = "Tocineta crujiente, cheddar y salsa ahumada de la casa.",
                Price = 550m, ImageUrl = Img("1586190848861-99aa4a171e90"),
                ImageAlt = "Hamburguesa con tocineta, queso cheddar, lechuga y tomate sobre fondo oscuro",
                Badge = ProductBadge.Heart, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 102, Slug = "triple-smash", Name = "Triple Smash", Category = ProductCategory.Burger,
                Description = "Tres carnes aplastadas a la plancha y queso por todos lados.",
                Price = 695m, ImageUrl = Img("1607013251379-e6eecfffe234"),
                ImageAlt = "Hamburguesa smash de tres carnes con queso fundido y pepinillos",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 103, Slug = "crispy-chicken", Name = "Crispy Chicken", Category = ProductCategory.Burger,
                Description = "Pollo empanizado, ensalada de repollo y salsa rosada.",
                Price = 495m, ImageUrl = Img("1606755962773-d324e0a13086"),
                ImageAlt = "Sándwich de pollo crujiente con ensalada de repollo y salsa en pan brioche",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 104, Slug = "tropical-cravvy", Name = "Tropical Cravvy", Category = ProductCategory.Burger,
                Description = "Con piña a la plancha, aguacate y un toque de picante.",
                Price = 525m, ImageUrl = Img("1525059696034-4967a8e1dca2"),
                ImageAlt = "Hamburguesa con piña, aguacate y vegetales frescos en pan brioche",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 105, Slug = "veggie-groove", Name = "Veggie Groove", Category = ProductCategory.Burger,
                Description = "Medallón de garbanzos, aguacate y vegetales frescos.",
                Price = 475m, ImageUrl = Img("1520072959219-c595dc870360"),
                ImageAlt = "Hamburguesa vegetariana con aguacate, tomate y rúcula",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 106, Slug = "onion-rings", Name = "Aros de Cebolla", Category = ProductCategory.Side,
                Description = "Empanizados y crujientes, con salsa para mojar.",
                Price = 250m, ImageUrl = Img("1639024471283-03518883512d"),
                ImageAlt = "Aros de cebolla fritos y dorados sobre papel de periódico",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 107, Slug = "hot-wings", Name = "Alitas Picantes", Category = ProductCategory.Side,
                Description = "Ocho alitas bañadas en salsa búfalo de la casa.",
                Price = 425m, ImageUrl = Img("1608039755401-742074f0548d"),
                ImageAlt = "Alitas de pollo con salsa picante en una cesta",
                Badge = ProductBadge.Heart, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 108, Slug = "chicken-tenders", Name = "Tenders Crujientes", Category = ProductCategory.Side,
                Description = "Tiras de pollo empanizado con salsa de miel y mostaza.",
                Price = 375m, ImageUrl = Img("1562967914-608f82629710"),
                ImageAlt = "Tiras de pollo empanizado con lechuga y salsa para mojar",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 109, Slug = "oreo-shake", Name = "Batida de Oreo", Category = ProductCategory.Drink,
                Description = "Helado de vainilla, galleta triturada y crema batida.",
                Price = 295m, ImageUrl = Img("1572490122747-3968b75cc699"),
                ImageAlt = "Batida de chocolate con galleta Oreo y crema batida",
                Badge = ProductBadge.Heart, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 110, Slug = "strawberry-shake", Name = "Batida de Fresa", Category = ProductCategory.Drink,
                Description = "Con fresas de verdad, como en los 70.",
                Price = 275m, ImageUrl = Img("1579954115545-a95591f28bfc"),
                ImageAlt = "Batida rosada de fresa con fresas frescas",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 111, Slug = "house-lemonade", Name = "Limonada de la Casa", Category = ProductCategory.Drink,
                Description = "Recién exprimida, con menta y mucho hielo.",
                Price = 175m, ImageUrl = Img("1621263764928-df1444c5e859"),
                ImageAlt = "Vaso de limonada con rodajas de limón, menta y hielo",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 112, Slug = "passion-fruit-juice", Name = "Jugo de Chinola", Category = ProductCategory.Drink,
                Description = "Natural, bien frío y con el dulce justo.",
                Price = 195m, ImageUrl = Img("1523371054106-bbf80586c38c"),
                ImageAlt = "Vaso de jugo amarillo con una rodaja de fruta y romero",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 113, Slug = "fudge-brownie", Name = "Brownie Fudge", Category = ProductCategory.Dessert,
                Description = "Tibio, húmedo y con trozos de chocolate.",
                Price = 225m, ImageUrl = Img("1606313564200-e75d5e30476c"),
                ImageAlt = "Brownie de chocolate cortado en cuadros",
                Badge = ProductBadge.Sticker, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 114, Slug = "sprinkle-donuts", Name = "Donas Sprinkle", Category = ProductCategory.Dessert,
                Description = "Dos donas glaseadas con chispas de colores.",
                Price = 195m, ImageUrl = Img("1551024601-bec78aea704b"),
                ImageAlt = "Donas glaseadas con chocolate y chispas de colores",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            },
            new
            {
                Id = 115, Slug = "ice-cream-cone", Name = "Helado en Barquilla", Category = ProductCategory.Dessert,
                Description = "Fresa o vainilla, en barquilla crujiente.",
                Price = 150m, ImageUrl = Img("1497034825429-c343d7c6a68f"),
                ImageAlt = "Mano sosteniendo una barquilla de helado rosado sobre fondo amarillo",
                Badge = ProductBadge.None, IsFavorite = false, IsAvailable = true, IsArchived = false
            });
    }
}
