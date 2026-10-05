using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;
using RentalRoom.Api.DAO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RentalRoom.Api.Common.Auth;
using Microsoft.OpenApi.Models;
using RentalRoom.Api.Common.Exceptions;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT key is not configured.");
}

// Cấu hình Authentication & JWT
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };
    });

builder.Services.AddAuthorization();

// 1. Đăng ký các dịch vụ (Services) vào DI Container
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy => {
        policy.WithOrigins("http://localhost:5173") // Port của React Vite
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();

// Đăng ký DAOs và Biz
builder.Services.AddScoped<DbConnectionFactory>();
builder.Services.AddScoped<RoomImageDAO>();
builder.Services.AddScoped<RoomDAO>();
builder.Services.AddScoped<RoomBiz>();
builder.Services.AddScoped<UserDAO>();
builder.Services.AddScoped<AuthBiz>();
builder.Services.AddScoped<RoomAmenityDAO>();
builder.Services.AddScoped<AmenityDAO>();
builder.Services.AddScoped<AmenityBiz>();
builder.Services.AddScoped<FavoriteDAO>();
builder.Services.AddScoped<FavoriteBiz>();
builder.Services.AddScoped<ReportDAO>();
builder.Services.AddScoped<ReportBiz>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Cấu hình Swagger (Đã gộp lại cho chuẩn, xóa dòng bị lặp)
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token. Ví dụ: Bearer eyJ..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 2. Tiến hành Build ứng dụng để tạo ra đối tượng 'app'
var app = builder.Build();

// 3. Cấu hình các Middleware xử lý HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CẤU HÌNH STATIC FILES (Đã fix lỗi CORS cho file ảnh)
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Cho phép frontend fetch ảnh cũ mà không bị chặn
        ctx.Context.Response.Headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
        ctx.Context.Response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    }
});

// THỨ TỰ MIDDLEWARE BẮT BUỘC PHẢI CHUẨN
app.UseCors("AllowReact");
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();