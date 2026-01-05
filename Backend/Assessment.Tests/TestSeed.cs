using Assessment.Domain.Entities;
using Assessment.Domain.Enum;
using Assessment.Infrastructure.Persistence;

namespace Assessment.Tests;

public static class TestSeed
{
    public static async Task<Course> CreateCourseAsync(ApplicationDbContext db, string title = "Course 1")
    {
        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = title,
            Status = CourseStatus.Draft,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Courses.Add(course);
        await db.SaveChangesAsync();
        return course;
    }

    public static async Task<Lesson> CreateLessonAsync(ApplicationDbContext db, Guid courseId, string title, int order)
    {
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = title,
            Order = order,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Lessons.Add(lesson);
        await db.SaveChangesAsync();
        return lesson;
    }
}