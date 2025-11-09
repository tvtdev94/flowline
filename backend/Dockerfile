# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["Flowline.Api/Flowline.Api.csproj", "Flowline.Api/"]
COPY ["Flowline.Application/Flowline.Application.csproj", "Flowline.Application/"]
COPY ["Flowline.Domain/Flowline.Domain.csproj", "Flowline.Domain/"]
COPY ["Flowline.Infrastructure/Flowline.Infrastructure.csproj", "Flowline.Infrastructure/"]

RUN dotnet restore "Flowline.Api/Flowline.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Flowline.Api"
RUN dotnet build "Flowline.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Flowline.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 5000

COPY --from=publish /app/publish .

# Set environment variable for ASP.NET Core
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "Flowline.Api.dll"]
