using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Tests;

public class OrderTests
{
    [Fact]
    public void Nuevo_pedido_empieza_pendiente_y_sin_productos()
    {
        var order = TestData.Order("  Ana  ");

        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Equal("Ana", order.CustomerName);
        Assert.Empty(order.Items);
        Assert.Equal(0m, order.Total);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Nombre_de_cliente_es_obligatorio(string name) =>
        Assert.Throws<DomainException>(() => TestData.Order(name));

    [Fact]
    public void Codigo_con_formato_invalido_se_rechaza() =>
        Assert.Throws<DomainException>(() => new Order("Ana", "BC-1234"));

    [Fact]
    public void Total_suma_los_subtotales_con_el_precio_del_producto()
    {
        var order = TestData.Order();
        order.AddItem(TestData.Product(1, 8.99m), 2);
        order.AddItem(TestData.Product(2, 4.99m), 1);

        Assert.Equal(22.97m, order.Total);
    }

    [Fact]
    public void Agregar_el_mismo_producto_suma_cantidades_en_una_linea()
    {
        var order = TestData.Order();
        var burger = TestData.Product(1);

        order.AddItem(burger, 1);
        order.AddItem(burger, 2);

        var item = Assert.Single(order.Items);
        Assert.Equal(3, item.Quantity);
    }

    [Fact]
    public void El_precio_queda_congelado_al_momento_del_pedido()
    {
        var order = TestData.Order();
        var burger = TestData.Product(1, 8.99m);
        order.AddItem(burger, 1);

        burger.ChangePrice(20m);

        Assert.Equal(8.99m, order.Total);
    }

    [Fact]
    public void No_se_puede_agregar_un_producto_agotado()
    {
        var burger = TestData.Product(1);
        burger.SetAvailability(false);

        Assert.Throws<DomainException>(() => TestData.Order().AddItem(burger, 1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(OrderItem.MaxQuantity + 1)]
    public void Cantidad_fuera_de_rango_se_rechaza(int quantity) =>
        Assert.Throws<DomainException>(() => TestData.Order().AddItem(TestData.Product(), quantity));

    [Fact]
    public void Pedido_vacio_no_es_valido() =>
        Assert.Throws<DomainException>(() => TestData.Order().EnsureHasItems());

    [Fact]
    public void Flujo_completo_pendiente_preparacion_listo_entregado()
    {
        var order = TestData.Order();

        order.StartPreparing();
        Assert.Equal(OrderStatus.Preparing, order.Status);
        order.MarkReady();
        Assert.Equal(OrderStatus.Ready, order.Status);
        order.MarkDelivered();
        Assert.Equal(OrderStatus.Delivered, order.Status);
        Assert.NotNull(order.UpdatedAtUtc);
    }

    [Fact]
    public void No_se_puede_saltar_pasos()
    {
        var order = TestData.Order();

        Assert.Throws<DomainException>(order.MarkReady);
        Assert.Throws<DomainException>(order.MarkDelivered);
        Assert.Equal(OrderStatus.Pending, order.Status);
    }

    [Fact]
    public void Se_puede_cancelar_pendiente_o_en_preparacion()
    {
        var pending = TestData.Order();
        pending.Cancel();
        Assert.Equal(OrderStatus.Cancelled, pending.Status);

        var preparing = TestData.Order();
        preparing.StartPreparing();
        preparing.Cancel();
        Assert.Equal(OrderStatus.Cancelled, preparing.Status);
    }

    [Fact]
    public void No_se_puede_cancelar_un_pedido_listo()
    {
        var order = TestData.Order();
        order.StartPreparing();
        order.MarkReady();

        var ex = Assert.Throws<DomainException>(order.Cancel);
        Assert.Contains("Listo", ex.Message);
    }

    [Fact]
    public void Un_pedido_cancelado_no_vuelve_a_la_cola()
    {
        var order = TestData.Order();
        order.Cancel();

        Assert.Throws<DomainException>(order.StartPreparing);
    }
}
