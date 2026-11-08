using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Tests;

public class ProductTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Precio_debe_ser_positivo(decimal price) =>
        Assert.Throws<DomainException>(() => TestData.Product(price: price));

    [Fact]
    public void Precio_se_redondea_a_dos_decimales()
    {
        var product = TestData.Product();
        product.ChangePrice(9.999m);
        Assert.Equal(10.00m, product.Price);
    }

    [Fact]
    public void Producto_nuevo_esta_disponible() => Assert.True(TestData.Product().IsAvailable);

    [Fact]
    public void Precio_por_encima_del_maximo_se_rechaza() =>
        Assert.Throws<DomainException>(() => TestData.Product().ChangePrice(Product.MaxPrice + 1));

    [Fact]
    public void Editar_detalles_limpia_espacios_y_usa_el_nombre_como_texto_alternativo()
    {
        var product = TestData.Product();
        product.UpdateDetails("  Bacon Lovers ", " Crujiente ", "https://example.test/b.jpg", "", ProductBadge.Heart);

        Assert.Equal("Bacon Lovers", product.Name);
        Assert.Equal("Crujiente", product.Description);
        Assert.Equal("Bacon Lovers", product.ImageAlt);
        Assert.Equal(ProductBadge.Heart, product.Badge);
    }

    [Theory]
    [InlineData("", "https://example.test/b.jpg")]
    [InlineData("Bacon", "")]
    public void Nombre_y_foto_son_obligatorios(string name, string image) =>
        Assert.Throws<DomainException>(() => TestData.Product().UpdateDetails(name, "", image, "", ProductBadge.Sticker));

    [Fact]
    public void Distintivo_desconocido_se_rechaza() =>
        Assert.Throws<DomainException>(() =>
            TestData.Product().UpdateDetails("Bacon", "", "https://example.test/b.jpg", "", (ProductBadge)99));

    [Fact]
    public void Producto_nuevo_es_hamburguesa_si_no_se_indica_categoria() =>
        Assert.Equal(ProductCategory.Burger, TestData.Product().Category);

    [Fact]
    public void Cambiar_categoria_lo_mueve_de_seccion()
    {
        var product = TestData.Product();
        product.ChangeCategory(ProductCategory.Dessert);
        Assert.Equal(ProductCategory.Dessert, product.Category);
    }

    [Fact]
    public void Categoria_desconocida_se_rechaza() =>
        Assert.Throws<DomainException>(() => TestData.Product().ChangeCategory((ProductCategory)99));

    [Fact]
    public void Retirar_quita_de_favoritos_y_no_se_puede_pedir()
    {
        var product = TestData.Product();
        product.Archive();

        Assert.True(product.IsArchived);
        Assert.False(product.IsFavorite);
        Assert.False(product.CanBeOrdered);
        var ex = Assert.Throws<DomainException>(() => TestData.Order().AddItem(product, 1));
        Assert.Contains("ya no está en el menú", ex.Message);
    }

    [Fact]
    public void Reactivar_permite_pedirlo_otra_vez()
    {
        var product = TestData.Product();
        product.Archive();
        product.Restore();

        Assert.True(product.CanBeOrdered);
    }
}

public class EmployeeTests
{
    [Fact]
    public void Correo_se_normaliza_en_minusculas()
    {
        var employee = new Employee("  Cocina@BurgerCravvy.TEST ", "Equipo", EmployeeRole.Empleado);
        Assert.Equal("cocina@burgercravvy.test", employee.Email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("sin-arroba")]
    public void Correo_invalido_se_rechaza(string email) =>
        Assert.Throws<DomainException>(() => new Employee(email, "Equipo", EmployeeRole.Empleado));
}

public class OrderCodeTests
{
    [Fact]
    public void Codigo_generado_tiene_formato_valido_con_la_fecha()
    {
        var code = OrderCode.Generate(new DateTime(2026, 10, 15, 0, 0, 0, DateTimeKind.Utc));

        Assert.StartsWith("BC-261015-", code);
        Assert.True(OrderCode.IsValid(code));
    }

    [Theory]
    [InlineData("BC-261015-1234")]      // formato antiguo
    [InlineData("BC-261015-ABCDE0")]    // 0 no está en el alfabeto
    [InlineData("bc-261015-ABCDEF")]
    [InlineData(null)]
    public void Codigos_invalidos(string? code) => Assert.False(OrderCode.IsValid(code));

    [Fact]
    public void Todos_los_codigos_generados_son_validos()
    {
        var now = DateTime.UtcNow;
        Assert.All(Enumerable.Range(0, 500).Select(_ => OrderCode.Generate(now)), c => Assert.True(OrderCode.IsValid(c)));
    }
}
