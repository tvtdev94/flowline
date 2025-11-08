using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using Flowline.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.GoogleId).IsUnique();
            entity.HasIndex(e => e.Email);
            entity.Property(e => e.GoogleId).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Picture).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Project Configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Color).HasMaxLength(7).IsRequired(); // #RRGGBB
            entity.Property(e => e.IsArchived).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Task Configuration
        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Color).HasMaxLength(7).IsRequired();
            entity.Property(e => e.Status)
                .HasConversion<string>()
                .IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // TimeEntry Configuration
        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.ToTable("TimeEntries");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TaskId);
            entity.HasIndex(e => e.StartTime);
            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Ignore(e => e.Duration); // Computed property
        });
    }
}
