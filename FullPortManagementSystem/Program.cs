using FullPortManagementSystem.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PortDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//builder.Services.AddHostedService<VesselDataGenerator>(); // I AM NOT GENERATING AGAIN AND AGAIN ANYMORE

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

builder.Services.AddHttpClient("MlService", client =>
{
    client.BaseAddress = new Uri("https://49a4-2001-1470-ff35-1-8d43-a825-7e8b-6c0a.ngrok-free.app/api/vesselEvent"); // ← your ngrok URL
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

builder.Services.AddHostedService<VesselStatusScheduler>(); // This will run every minute to update vessel status

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PortDbContext>();

    //// 🚨 Wipe everything clean
    //db.VesselEvents.RemoveRange(db.VesselEvents);
    //db.SaveChanges();

    //db.Database.EnsureCreated();
    //DataSeeder.Seed(db); // only 2 vessels
}

app.Run();
