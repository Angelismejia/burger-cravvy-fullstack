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
