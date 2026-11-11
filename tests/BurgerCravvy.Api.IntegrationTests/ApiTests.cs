using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using Microsoft.Extensions.DependencyInjection;

namespace BurgerCravvy.Api.IntegrationTests;

[Collection(ApiCollection.Name)]
public class ApiTests(ApiFactory api)
{
    // Ojo: la API acepta 10 pedidos por minuto por IP; estos tests crean menos de 10 en total.

    private async Task<OrderDto> PlaceOrderAsync(string customer = "Ana", int quantity = 2)
    {
        var res = await api.CreateClient().PostAsJsonAsync("/api/pedidos",
            new CreateOrderRequest(customer, [new CreateOrderItemRequest("classic-cravvy", quantity)]));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        return (await res.Content.ReadFromJsonAsync<OrderDto>())!;
    }

    [Fact]
    public async Task El_menu_sale_de_la_base_con_los_datos_semilla()
    {
        var menu = await api.CreateClient().GetFromJsonAsync<List<ProductDto>>("/api/productos");

        Assert.Equal(18, menu!.Count);
        Assert.Contains(menu, p => p.Id == "classic-cravvy");
    }

    [Fact]
    public async Task Un_pedido_se_guarda_con_el_precio_de_la_base_y_se_puede_seguir()
    {
        var price = (await api.CreateClient().GetFromJsonAsync<ProductDto>("/api/productos/classic-cravvy"))!.Price;

        var created = await PlaceOrderAsync(quantity: 3);
        var tracked = await api.CreateClient().GetFromJsonAsync<OrderDto>($"/api/pedidos/{created.Code}");

        Assert.Equal("Pending", tracked!.Status);
        Assert.Equal(price * 3, tracked.Total);
    }

    [Fact]
    public async Task Un_pedido_invalido_devuelve_400_con_los_errores_por_campo()
    {
        var res = await api.CreateClient().PostAsJsonAsync("/api/pedidos", new CreateOrderRequest("", []));

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var problem = await res.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("customerName", out _));
    }

    [Fact]
    public async Task El_panel_sin_token_devuelve_401() =>
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await api.CreateClient().GetAsync("/api/panel/pedidos")).StatusCode);

    [Fact]
    public async Task Un_empleado_mueve_pedidos_pero_no_puede_crear_productos()
    {
        var order = await PlaceOrderAsync("Luis");
        var kitchen = await api.ClientAsAsync(ApiFactory.EmployeeEmail);

        var moved = await kitchen.PatchAsJsonAsync($"/api/panel/pedidos/{order.Code}/estado",
            new ChangeOrderStatusRequest("preparar"));
        var create = await kitchen.PostAsJsonAsync("/api/panel/productos",
            new SaveProductRequest("Nueva", "Desc", 100, "https://example.test/a.jpg", "Alt", "sticker", false, "burger"));

        Assert.Equal(HttpStatusCode.OK, moved.StatusCode);
        Assert.Equal("Preparing", (await moved.Content.ReadFromJsonAsync<OrderDto>())!.Status);
        Assert.Equal(HttpStatusCode.Forbidden, create.StatusCode);
    }

    [Fact]
    public async Task Una_transicion_no_permitida_devuelve_422()
    {
        var order = await PlaceOrderAsync("Marta");
        var kitchen = await api.ClientAsAsync(ApiFactory.EmployeeEmail);

        var res = await kitchen.PatchAsJsonAsync($"/api/panel/pedidos/{order.Code}/estado",
            new ChangeOrderStatusRequest("entregar"));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, res.StatusCode);
    }

    [Fact]
    public async Task Si_dos_empleados_cambian_el_mismo_pedido_a_la_vez_el_segundo_choca_con_el_RowVersion()
    {
        var order = await PlaceOrderAsync("Pedro");

        // Dos peticiones simultáneas: cada una con su propio DbContext y ambas leen el pedido "Pendiente".
        using var juan = api.Services.CreateScope();
        using var maria = api.Services.CreateScope();
        var orderDeJuan = (await juan.ServiceProvider.GetRequiredService<IOrderRepository>().GetByCodeForUpdateAsync(order.Code))!;
        var orderDeMaria = (await maria.ServiceProvider.GetRequiredService<IOrderRepository>().GetByCodeForUpdateAsync(order.Code))!;

        orderDeJuan.StartPreparing();
        await juan.ServiceProvider.GetRequiredService<IUnitOfWork>().SaveChangesAsync();

        orderDeMaria.Cancel(); // válido según lo que María leyó, pero ya no es la versión actual
        await Assert.ThrowsAsync<ConflictException>(() =>
            maria.ServiceProvider.GetRequiredService<IUnitOfWork>().SaveChangesAsync());

        var final = await api.CreateClient().GetFromJsonAsync<OrderDto>($"/api/pedidos/{order.Code}");
        Assert.Equal("Preparing", final!.Status);
    }

    [Fact]
    public async Task Los_endpoints_de_salud_responden()
    {
        var client = api.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/db")).StatusCode);
    }
}
