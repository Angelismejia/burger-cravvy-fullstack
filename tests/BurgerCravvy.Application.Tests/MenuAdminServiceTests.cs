using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Application.Services;

namespace BurgerCravvy.Application.Tests;

public class MenuAdminServiceTests
{
    private readonly FakeProductRepository _products = new(TestData.Product(1, "classic-cravvy", 8.99m));
    private readonly FakeUnitOfWork _uow = new();
    private readonly FakeNotifier _notifier = new();

    private MenuAdminService Service() => new(_products, _uow, _notifier);

    private static SaveProductRequest Request(
        string? name = "Bacon Lovers", decimal? price = 10.5m, string? imageUrl = "https://images.example.test/bacon.jpg",
        string? badge = "heart", bool favorite = true, string? description = "Doble bacon crujiente.") =>
        new(name, description, price, imageUrl, "Hamburguesa con bacon", badge, favorite);

    [Fact]
    public async Task Crea_un_producto_con_slug_a_partir_del_nombre()
    {
        var dto = await Service().CreateAsync(Request("Bacon Lovers Ñam"));

        Assert.Equal("bacon-lovers-nam", dto.Id);
        Assert.Equal(10.5m, dto.Price);
        Assert.Equal("heart", dto.Badge);
        Assert.True(dto.IsFavorite);
        Assert.True(dto.IsAvailable);
        Assert.Equal(2, _products.Items.Count);
        Assert.Equal(1, _uow.SaveCount);
        Assert.Equal([("ProductUpdated", "bacon-lovers-nam")], _notifier.Sent);
    }

    [Fact]
    public async Task Si_el_slug_existe_agrega_un_numero()
    {
        var dto = await Service().CreateAsync(Request("Classic Cravvy"));
        Assert.Equal("classic-cravvy-2", dto.Id);
    }

    [Theory]
    [InlineData("¡Súper  Papas!", "super-papas")]
    [InlineData("Combo #1 (familiar)", "combo-1-familiar")]
    [InlineData("!!!", "producto")]
    public void Slugify_limpia_acentos_y_simbolos(string name, string expected) =>
        Assert.Equal(expected, MenuAdminService.Slugify(name));

    [Fact]
    public async Task Datos_invalidos_devuelven_todos_los_errores_juntos()
    {
        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            Service().CreateAsync(Request(name: " ", price: 0, imageUrl: "no-es-url", badge: "estrella")));

        Assert.Equal(["badge", "imageUrl", "name", "price"], ex.Errors.Keys.Order());
        Assert.Equal(0, _uow.SaveCount);
        Assert.Empty(_notifier.Sent);
    }

    [Fact]
    public async Task Precio_por_encima_del_maximo_se_rechaza() =>
        await Assert.ThrowsAsync<ValidationException>(() => Service().CreateAsync(Request(price: BurgerCravvy.Domain.Entities.Product.MaxPrice + 1)));

    [Fact]
    public async Task Editar_cambia_datos_y_precio_pero_no_el_slug()
    {
        var dto = await Service().UpdateAsync("classic-cravvy", Request("Classic Cravvy XL", price: 9.75m, favorite: false));

        Assert.Equal("classic-cravvy", dto.Id);
        Assert.Equal("Classic Cravvy XL", dto.Name);
        Assert.Equal(9.75m, dto.Price);
        Assert.False(dto.IsFavorite);
    }

    [Fact]
    public async Task Retirar_lo_saca_del_menu_y_de_favoritos()
    {
        var dto = await Service().ArchiveAsync("classic-cravvy");

        Assert.True(dto.IsArchived);
        Assert.False(dto.IsFavorite);
        Assert.Equal([("ProductUpdated", "classic-cravvy")], _notifier.Sent);
    }

    [Fact]
    public async Task Reactivar_lo_devuelve_al_menu()
    {
        await Service().ArchiveAsync("classic-cravvy");

        var dto = await Service().RestoreAsync("classic-cravvy");

        Assert.False(dto.IsArchived);
    }

    [Fact]
    public async Task Producto_retirado_no_existe_para_el_publico()
    {
        await Service().ArchiveAsync("classic-cravvy");

        await Assert.ThrowsAsync<NotFoundException>(() => new ProductService(_products).GetBySlugAsync("classic-cravvy"));
        Assert.Empty(await new ProductService(_products).GetMenuAsync(onlyFavorites: false));
    }

    [Fact]
    public async Task Editar_un_producto_inexistente_devuelve_no_encontrado() =>
        await Assert.ThrowsAsync<NotFoundException>(() => Service().UpdateAsync("no-existe", Request()));
}
