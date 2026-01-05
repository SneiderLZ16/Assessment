using Assessment.Application.Services;
using Assessment.Domain.Enum;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Assessment.Tests;

public class CourseServiceTests
{
    [Fact]
    public async Task PublishCourse_WithoutLessons_ShouldFail()
    {
        using var factory = new TestDbFactory();
        using var db = factory.CreateDbContext();

        var course = await TestSeed.CreateCourseAsync(db, "No lessons course");
        var service = new CourseService(db);

        Func<Task> act = async () => await service.PublishAsync(course.Id);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*without at least one active lesson*");
    }

    [Fact]
    public async Task PublishCourse_WithLessons_ShouldSucceed_AndSetStatusPublished()
    {
        using var factory = new TestDbFactory();
        using var db = factory.CreateDbContext();

        var course = await TestSeed.CreateCourseAsync(db, "Has lessons");
        _ = await TestSeed.CreateLessonAsync(db, course.Id, "Lesson 1", 1);

        var service = new CourseService(db);

        await service.PublishAsync(course.Id);

        var updated = await db.Courses.FirstAsync(c => c.Id == course.Id);
        updated.Status.Should().Be(CourseStatus.Published);
    }

    [Fact]
    public async Task GetCourseSummary_ShouldReturnTotalLessons_AndLastModification()
    {
        using var factory = new TestDbFactory();
        using var db = factory.CreateDbContext();

        var course = await TestSeed.CreateCourseAsync(db, "Summary course");
        var l1 = await TestSeed.CreateLessonAsync(db, course.Id, "L1", 1);
        var l2 = await TestSeed.CreateLessonAsync(db, course.Id, "L2", 2);

      
        l2.Title = "L2 updated";
        l2.UpdatedAt = DateTime.UtcNow.AddMinutes(10);
        await db.SaveChangesAsync();

        var service = new CourseService(db);

        var summary = await service.GetSummaryAsync(course.Id);

        summary.Id.Should().Be(course.Id);
        summary.TotalLessons.Should().Be(2);
        summary.LastModification.Should().BeCloseTo(l2.UpdatedAt, precision: TimeSpan.FromSeconds(2));
    }
}
