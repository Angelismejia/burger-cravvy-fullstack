using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BurgerCravvy.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Añade la categoría del producto (burger, side, drink, dessert) y amplía el menú
    /// con 15 productos nuevos (Id 101–115) con precios en RD$.
    /// </summary>
    public partial class MenuConCategorias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Los productos que ya existan (incluidos los creados por el Admin en producción)
            // quedan como hamburguesas; "" no es una categoría válida y rompería la lectura.
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Productos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Burger");

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 1,
                column: "Category",
                value: "Burger");

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 2,
                column: "Category",
                value: "Burger");

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 3,
                column: "Category",
                value: "Side");

            migrationBuilder.InsertData(
                table: "Productos",
                columns: new[] { "Id", "Badge", "Category", "Description", "ImageAlt", "ImageUrl", "IsArchived", "IsAvailable", "IsFavorite", "Name", "Price", "Slug" },
                values: new object[,]
                {
                    { 101, "Heart", "Burger", "Tocineta crujiente, cheddar y salsa ahumada de la casa.", "Hamburguesa con tocineta, queso cheddar, lechuga y tomate sobre fondo oscuro", "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=75", false, true, false, "Bacon Boom", 550m, "bacon-boom" },
                    { 102, "None", "Burger", "Tres carnes aplastadas a la plancha y queso por todos lados.", "Hamburguesa smash de tres carnes con queso fundido y pepinillos", "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=800&q=75", false, true, false, "Triple Smash", 695m, "triple-smash" },
                    { 103, "None", "Burger", "Pollo empanizado, ensalada de repollo y salsa rosada.", "Sándwich de pollo crujiente con ensalada de repollo y salsa en pan brioche", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=75", false, true, false, "Crispy Chicken", 495m, "crispy-chicken" },
                    { 104, "None", "Burger", "Con piña a la plancha, aguacate y un toque de picante.", "Hamburguesa con piña, aguacate y vegetales frescos en pan brioche", "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=75", false, true, false, "Tropical Cravvy", 525m, "tropical-cravvy" },
                    { 105, "None", "Burger", "Medallón de garbanzos, aguacate y vegetales frescos.", "Hamburguesa vegetariana con aguacate, tomate y rúcula", "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=75", false, true, false, "Veggie Groove", 475m, "veggie-groove" },
                    { 106, "None", "Side", "Empanizados y crujientes, con salsa para mojar.", "Aros de cebolla fritos y dorados sobre papel de periódico", "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=75", false, true, false, "Aros de Cebolla", 250m, "onion-rings" },
                    { 107, "Heart", "Side", "Ocho alitas bañadas en salsa búfalo de la casa.", "Alitas de pollo con salsa picante en una cesta", "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=75", false, true, false, "Alitas Picantes", 425m, "hot-wings" },
                    { 108, "None", "Side", "Tiras de pollo empanizado con salsa de miel y mostaza.", "Tiras de pollo empanizado con lechuga y salsa para mojar", "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=75", false, true, false, "Tenders Crujientes", 375m, "chicken-tenders" },
                    { 109, "Heart", "Drink", "Helado de vainilla, galleta triturada y crema batida.", "Batida de chocolate con galleta Oreo y crema batida", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=75", false, true, false, "Batida de Oreo", 295m, "oreo-shake" },
                    { 110, "None", "Drink", "Con fresas de verdad, como en los 70.", "Batida rosada de fresa con fresas frescas", "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=75", false, true, false, "Batida de Fresa", 275m, "strawberry-shake" },
                    { 111, "None", "Drink", "Recién exprimida, con menta y mucho hielo.", "Vaso de limonada con rodajas de limón, menta y hielo", "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=75", false, true, false, "Limonada de la Casa", 175m, "house-lemonade" },
                    { 112, "None", "Drink", "Natural, bien frío y con el dulce justo.", "Vaso de jugo amarillo con una rodaja de fruta y romero", "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=800&q=75", false, true, false, "Jugo de Chinola", 195m, "passion-fruit-juice" },
                    { 113, "Sticker", "Dessert", "Tibio, húmedo y con trozos de chocolate.", "Brownie de chocolate cortado en cuadros", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=75", false, true, false, "Brownie Fudge", 225m, "fudge-brownie" },
                    { 114, "None", "Dessert", "Dos donas glaseadas con chispas de colores.", "Donas glaseadas con chocolate y chispas de colores", "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=75", false, true, false, "Donas Sprinkle", 195m, "sprinkle-donuts" },
                    { 115, "None", "Dessert", "Fresa o vainilla, en barquilla crujiente.", "Mano sosteniendo una barquilla de helado rosado sobre fondo amarillo", "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=75", false, true, false, "Helado en Barquilla", 150m, "ice-cream-cone" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "Id",
                keyValue: 115);

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Productos");
        }
    }
}
