using System.Text;
using System.Threading.RateLimiting;
using BurgerCravvy.Api;
using BurgerCravvy.Api.Middleware;
using BurgerCravvy.Api.Realtime;
using BurgerCravvy.Api.Swagger;
using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application;
using BurgerCravvy.Infrastructure;
using BurgerCravvy.Infrastructure.Persistence;
using BurgerCravvy.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// --- Autenticación JWT para el panel de empleados ---
var jwt = builder.Configuration.GetSection(JwtOptions.Section).Get<JwtOptions>() ?? new JwtOptions();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = true;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
        // Los WebSockets no admiten cabeceras: SignalR manda el JWT en la query (?access_token=).
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) && ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// Máximo 5 intentos de login por minuto y por IP.
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy(RateLimitPolicies.Login, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1) }));
});

// --- Tiempo real ---
builder.Services.AddSignalR();
builder.Services.AddSingleton<IRealtimeNotifier, SignalRNotifier>();

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Burger Cravvy API",
        Version = "v1",
        Description = "Menú, pedidos y panel de cocina. Para los endpoints 🔒: haz login en " +
                      "POST /api/auth/login, copia el token y pégalo en el botón «Authorize»."
    });

    // Botón «Authorize»: el token se pega sin el prefijo "Bearer".
    o.AddSecurityDefinition(AuthorizeOperationFilter.SchemeName, new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Pega aquí el token que devuelve POST /api/auth/login."
    });
    o.OperationFilter<AuthorizeOperationFilter>();

    // Los comentarios /// de los controladores aparecen como descripción de cada endpoint.
    var xml = Path.Combine(AppContext.BaseDirectory, $"{typeof(Program).Assembly.GetName().Name}.xml");
    if (File.Exists(xml)) o.IncludeXmlComments(xml);
});

const string WebPolicy = "web";
// En producción la URL de la web (Netlify) llega por la variable de entorno Cors__WebUrl.
var allowedOrigins = (builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
    .Append(builder.Configuration["Cors:WebUrl"]?.TrimEnd('/'))
    .OfType<string>()
    .Where(o => o.Length > 0)
    .ToArray();
builder.Services.AddCors(o => o.AddPolicy(WebPolicy, p =>
    p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials())); // credenciales: requeridas por SignalR

var app = builder.Build();

app.UseExceptionHandler();

// Swagger también en producción: es un proyecto de portafolio y sirve de documentación pública.
app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.DocumentTitle = "Burger Cravvy API";
    o.EnablePersistAuthorization(); // el token sobrevive a recargar la página
});

// Aplica migraciones y crea los usuarios configurados en SeedEmployee/SeedAdmin
// (en desarrollo vienen de appsettings.Development.json; en Azure, de variables de entorno).
await DbSeeder.MigrateAndSeedAsync(app.Services, app.Configuration);

app.UseCors(WebPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<OrdersHub>(OrdersHub.Path);
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
