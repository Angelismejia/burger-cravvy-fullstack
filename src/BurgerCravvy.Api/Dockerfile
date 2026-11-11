# Se construye desde la raíz del repo: docker build -f src/BurgerCravvy.Api/Dockerfile .
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Primero solo los .csproj: si no cambian las dependencias, Docker reutiliza la capa del restore.
COPY src/BurgerCravvy.Domain/BurgerCravvy.Domain.csproj src/BurgerCravvy.Domain/
COPY src/BurgerCravvy.Application/BurgerCravvy.Application.csproj src/BurgerCravvy.Application/
COPY src/BurgerCravvy.Infrastructure/BurgerCravvy.Infrastructure.csproj src/BurgerCravvy.Infrastructure/
COPY src/BurgerCravvy.Api/BurgerCravvy.Api.csproj src/BurgerCravvy.Api/
RUN dotnet restore src/BurgerCravvy.Api/BurgerCravvy.Api.csproj

COPY src/ src/
RUN dotnet publish src/BurgerCravvy.Api/BurgerCravvy.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
# Usuario sin privilegios que trae la imagen oficial; escucha en el puerto 8080.
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "BurgerCravvy.Api.dll"]
