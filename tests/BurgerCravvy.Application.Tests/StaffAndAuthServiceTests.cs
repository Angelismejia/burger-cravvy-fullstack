using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Application.Services;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Application.Tests;

public class StaffServiceTests
{
    private readonly FakeProductRepository _products = new(TestData.Product(1, "classic-cravvy", 8.99m));
    private readonly FakeOrderRepository _orders = new();
    private readonly FakeUnitOfWork _uow = new();
    private readonly FakeNotifier _notifier = new();

    private StaffService Service() => new(_orders, _products, _uow, _notifier);

    private Order Seed()
    {
        var order = TestData.Order();
        _orders.Items.Add(order);
        return order;
    }

    [Theory]
    [InlineData("preparar", "Preparing")]
    [InlineData("  PREPARAR ", "Preparing")]
    [InlineData("cancelar", "Cancelled")]
    public async Task Cambia_el_estado_segun_la_accion(string action, string expected)
    {
        var order = Seed();

        var dto = await Service().ChangeOrderStatusAsync(order.Code, new ChangeOrderStatusRequest(action));

        Assert.Equal(expected, dto.Status);
        Assert.Equal(1, _uow.SaveCount);
        Assert.Equal([("OrderUpdated", order.Code)], _notifier.Sent);
    }

    [Fact]
    public async Task Accion_desconocida_es_error_de_validacion()
    {
        var order = Seed();

        await Assert.ThrowsAsync<ValidationException>(() =>
            Service().ChangeOrderStatusAsync(order.Code, new ChangeOrderStatusRequest("volar")));
        Assert.Equal(0, _uow.SaveCount);
    }

    [Fact]
    public async Task Transicion_invalida_la_bloquea_el_dominio()
    {
        var order = Seed();

        await Assert.ThrowsAsync<DomainException>(() =>
            Service().ChangeOrderStatusAsync(order.Code, new ChangeOrderStatusRequest("entregar")));
        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Empty(_notifier.Sent);
    }

    [Fact]
    public async Task Si_otro_empleado_guardo_antes_hay_conflicto_y_no_se_avisa_a_nadie()
    {
        var order = Seed();
        _uow.SimulateConflict = true;

        await Assert.ThrowsAsync<ConflictException>(() =>
            Service().ChangeOrderStatusAsync(order.Code, new ChangeOrderStatusRequest("preparar")));
        Assert.Empty(_notifier.Sent);
    }

    [Fact]
    public async Task Pedido_inexistente_devuelve_no_encontrado() =>
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Service().ChangeOrderStatusAsync("BC-261015-ZZZZZZ", new ChangeOrderStatusRequest("preparar")));

    [Fact]
    public async Task La_cola_excluye_entregados_y_cancelados()
    {
        Seed();
        var cancelled = Seed();
        cancelled.Cancel();

        var queue = await Service().GetOrderQueueAsync();

        Assert.Single(queue);
    }

    [Fact]
    public async Task Marca_un_producto_como_agotado_y_avisa()
    {
        var dto = await Service().SetAvailabilityAsync("classic-cravvy", new SetAvailabilityRequest(false));

        Assert.False(dto.IsAvailable);
        Assert.Equal([("ProductUpdated", "classic-cravvy")], _notifier.Sent);
    }

    [Fact]
    public async Task Disponibilidad_sin_valor_es_error_de_validacion() =>
        await Assert.ThrowsAsync<ValidationException>(() =>
            Service().SetAvailabilityAsync("classic-cravvy", new SetAvailabilityRequest(null)));

    [Fact]
    public async Task El_menu_del_panel_incluye_los_retirados()
    {
        _products.Items[0].Archive();

        var menu = await Service().GetMenuAsync();

        Assert.Single(menu);
        Assert.True(menu[0].IsArchived);
    }
}

public class AuthServiceTests
{
    private static Employee Employee(bool active = true)
    {
        var e = new Employee("cocina@burgercravvy.test", "Equipo Cocina", EmployeeRole.Empleado);
        e.SetPasswordHash("hash:secreta");
        if (!active) e.Deactivate();
        return e;
    }

    private static AuthService Service(Employee employee) =>
        new(new FakeEmployeeRepository(employee), new FakePasswordHasher(), new FakeTokenGenerator());

    [Fact]
    public async Task Credenciales_correctas_devuelven_token()
    {
        var res = await Service(Employee()).LoginAsync(new LoginRequest(" Cocina@BurgerCravvy.test ", "secreta"));

        Assert.Equal("token-cocina@burgercravvy.test", res.Token);
        Assert.Equal("Empleado", res.Role);
        Assert.Equal("Equipo Cocina", res.FullName);
    }

    [Theory]
    [InlineData("cocina@burgercravvy.test", "otra")]
    [InlineData("nadie@burgercravvy.test", "secreta")]
    public async Task Correo_o_contrasena_incorrectos_dan_el_mismo_error(string email, string password)
    {
        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() =>
            Service(Employee()).LoginAsync(new LoginRequest(email, password)));

        Assert.Equal("Correo o contraseña incorrectos.", ex.Message);
    }

    [Fact]
    public async Task Empleado_desactivado_no_puede_entrar() =>
        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            Service(Employee(active: false)).LoginAsync(new LoginRequest("cocina@burgercravvy.test", "secreta")));

    [Fact]
    public async Task Campos_vacios_son_error_de_validacion() =>
        await Assert.ThrowsAsync<ValidationException>(() =>
            Service(Employee()).LoginAsync(new LoginRequest("", null)));
}
