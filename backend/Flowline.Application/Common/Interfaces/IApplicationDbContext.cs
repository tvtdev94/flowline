using Flowline.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Project> Projects { get; }
    DbSet<TaskEntity> Tasks { get; }
    DbSet<TimeEntry> TimeEntries { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
