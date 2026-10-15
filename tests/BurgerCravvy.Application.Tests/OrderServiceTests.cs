using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Application.Services;
using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Application.Tests;

public class OrderServiceTests
{
    private readonly FakeProductRepository _products = new(
        TestData.Product(1, "classic-cravvy", 8.99m),
        TestData.Product(2, "golden-fries", 4.99m));
    private readonly FakeOrderRepository _orders = new();
    private readonly FakeUnitOfWork _uow = new();

    private OrderService Service() => new(_products, _orders, _uow);

    private static CreateOrderRequest Request(string? name = "Ana", params (string id, int qty)[] items) =>
        new(name, items.Select(i => new CreateOrderItemRequest(i.id, i.qty)).ToList());

    [Fact]
    public async Task Crea_el_pedido_con_precios_de_la_base_y_lo_guarda()
    {
        var dto = await Service().CreateAsync(Request("Ana", ("classic-cravvy", 2), ("golden-fries", 1)));

        Assert.Equal(22.97m, dto.Total);
        Assert.Equal("Pending", dto.Status);
        Assert.Equal("Pendiente", dto.StatusLabel);
        Assert.True(OrderCode.IsValid(dto.Code));
        Assert.Single(_orders.Items);
        Assert.Equal(1, _uow.SaveCount);
    }

    [Fact]
    public async Task Sin_nombre_ni_productos_devuelve_errores_de_validacion()
    {
        var ex = await Assert.ThrowsAsync<ValidationException>(() => Service().CreateAsync(Request(name: "")));

        Assert.Contains("customerName", ex.Errors.Keys);
        Assert.Contains("items", ex.Errors.Keys);
        Assert.Equal(0, _uow.SaveCount);
    }

    [Fact]
    public async Task Producto_inexistente_devuelve_no_encontrado()
    {
        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            Service().CreateAsync(Request("Ana", ("pizza", 1))));

        Assert.Contains("pizza", ex.Message);
        Assert.Empty(_orders.Items);
    }

    [Fact]
    public async Task Producto_agotado_no_se_puede_pedir()
    {
        _products.Items[0].SetAvailability(false);

        await Assert.ThrowsAsync<DomainException>(() =>
            Service().CreateAsync(Request("Ana", ("classic-cravvy", 1))));
    }

    [Fact]
    public async Task Si_el_codigo_ya_existe_genera_otro()
    {
        _orders.ForcedCollisions = 2;

        var dto = await Service().CreateAsync(Request("Ana", ("golden-fries", 1)));

        Assert.True(OrderCode.IsValid(dto.Code));
        Assert.Equal(0, _orders.ForcedCollisions);
    }

    [Fact]
    public async Task Tras_varias_colisiones_seguidas_falla_en_lugar_de_duplicar()
    {
        _orders.ForcedCollisions = 10;

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            Service().CreateAsync(Request("Ana", ("golden-fries", 1))));
        Assert.Empty(_orders.Items);
    }

    [Fact]
    public async Task Consulta_por_codigo_sin_importar_mayusculas_ni_espacios()
    {
        var created = await Service().CreateAsync(Request("Ana", ("golden-fries", 1)));

        var found = await Service().GetByCodeAsync($"  {created.Code.ToLowerInvariant()} ");

        Assert.Equal(created.Code, found.Code);
    }
}
