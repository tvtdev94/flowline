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
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
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

        // Team Configuration
        modelBuilder.Entity<Team>(entity =>
        {
            entity.ToTable("Teams");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OwnerId);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // TeamMember Configuration
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.ToTable("TeamMembers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TeamId, e.UserId }).IsUnique();

            // PERFORMANCE INDEX: Reverse lookup (get all teams for a user)
            entity.HasIndex(e => e.UserId);

            entity.Property(e => e.Role)
                .HasConversion<string>()
                .IsRequired();
            entity.Property(e => e.JoinedAt).IsRequired();
        });

        // Project Configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);

            // PERFORMANCE INDEX: Filter active projects for user
            entity.HasIndex(e => new { e.UserId, e.IsArchived });

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
            entity.HasIndex(e => e.TeamId);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.Status);

            // PERFORMANCE INDEXES
            // Filter by user and status (e.g., active tasks)
            entity.HasIndex(e => new { e.UserId, e.Status });
            // Team task queries with privacy filter
            entity.HasIndex(e => new { e.TeamId, e.IsPrivate });

            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Color).HasMaxLength(7).IsRequired();
            entity.Property(e => e.Status)
                .HasConversion<string>()
                .IsRequired();
            entity.Property(e => e.IsPrivate).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // TimeEntry Configuration
        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.ToTable("TimeEntries");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TaskId);
            entity.HasIndex(e => e.StartTime);

            // PERFORMANCE INDEXES
            // Critical for running timers query: WHERE EndTime IS NULL
            entity.HasIndex(e => e.EndTime);
            // Optimizes date range queries
            entity.HasIndex(e => new { e.StartTime, e.EndTime });

            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Ignore(e => e.Duration); // Computed property

            // Relationship: TimeEntry -> Task
            entity.HasOne(e => e.Task)
                .WithMany()
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
