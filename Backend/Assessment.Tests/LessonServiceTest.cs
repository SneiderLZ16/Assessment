using Assessment.Application.DTOs;
using Assessment.Application.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Assessment.Tests;

public class LessonServiceTests
{
    [Fact]
    public async Task CreateLesson_DuplicateOrderInSameCourse_ShouldFail()
    {
        using var factory = new TestDbFactory();
        using var db = factory.CreateDbContext();

        var course = await TestSeed.CreateCourseAsync(db, "Order unique");
        var service = new LessonService(db);

        _ = await service.CreateAsync(course.Id, new CreateLessonRequest("Lesson A", 1));

        Func<Task> act = async () =>
            await service.CreateAsync(course.Id, new CreateLessonRequest("Lesson B", 1));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*unique within the course*");
    }

    [Fact]
    public async Task Reorder_MoveUpAndDown_ShouldNotCreateDuplicateOrders()
    {
        using var factory = new TestDbFactory();
        using var db = factory.CreateDbContext();

        var course = await TestSeed.CreateCourseAsync(db, "Reorder course");
        var service = new LessonService(db);

        var l1Id = await service.CreateAsync(course.Id, new CreateLessonRequest("L1", 1));
        var l2Id = await service.CreateAsync(course.Id, new CreateLessonRequest("L2", 2));

      
        await service.MoveUpAsync(l2Id);

        var lessonsAfterUp = await db.Lessons
            .Where(l => l.CourseId == course.Id && !l.IsDeleted)
            .OrderBy(l => l.Order)
            .ToListAsync();

        lessonsAfterUp.Select(x => x.Order).Should().BeEquivalentTo(new[] { 1, 2 });
        lessonsAfterUp[0].Title.Should().Be("L2");
        lessonsAfterUp[1].Title.Should().Be("L1");

       
        await service.MoveDownAsync(l2Id);

        var lessonsAfterDown = await db.Lessons
            .Where(l => l.CourseId == course.Id && !l.IsDeleted)
            .OrderBy(l => l.Order)
            .ToListAsync();

        lessonsAfterDown.Select(x => x.Order).Should().BeEquivalentTo(new[] { 1, 2 });
        lessonsAfterDown[0].Title.Should().Be("L1");
        lessonsAfterDown[1].Title.Should().Be("L2");
    }
}
