using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Flowline.Infrastructure.Migrations
{
    /// <summary>
    /// Add performance indexes for frequently queried columns
    /// </summary>
    public partial class AddPerformanceIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TimeEntry: Index for running timers query (WHERE EndTime IS NULL)
            // This is critical for the timer background service
            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_EndTime",
                table: "TimeEntries",
                column: "EndTime");

            // TimeEntry: Composite index for user's time entries by date
            // Optimizes queries like: "Get entries for user on date X"
            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_StartTime_EndTime",
                table: "TimeEntries",
                columns: new[] { "StartTime", "EndTime" });

            // TeamMember: Index on UserId for reverse lookups
            // Optimizes: "Get all teams for this user"
            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_UserId",
                table: "TeamMembers",
                column: "UserId");

            // Task: Composite index for filtering active user tasks
            // Optimizes: "Get active tasks for user"
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId_Status",
                table: "Tasks",
                columns: new[] { "UserId", "Status" });

            // Task: Composite index for team task queries
            // Optimizes: "Get tasks for team"
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TeamId_IsPrivate",
                table: "Tasks",
                columns: new[] { "TeamId", "IsPrivate" });

            // Project: Index for archived projects filter
            // Optimizes: "Get active projects for user"
            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserId_IsArchived",
                table: "Projects",
                columns: new[] { "UserId", "IsArchived" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimeEntries_EndTime",
                table: "TimeEntries");

            migrationBuilder.DropIndex(
                name: "IX_TimeEntries_StartTime_EndTime",
                table: "TimeEntries");

            migrationBuilder.DropIndex(
                name: "IX_TeamMembers_UserId",
                table: "TeamMembers");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId_Status",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TeamId_IsPrivate",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Projects_UserId_IsArchived",
                table: "Projects");
        }
    }
}
