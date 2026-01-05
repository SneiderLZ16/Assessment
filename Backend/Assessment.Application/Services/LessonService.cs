using Assessment.Application.DTOs;
using Assessment.Domain.Entities;
using Assessment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Assessment.Application.Services;

public class LessonService : ILessonService
{
    private readonly ApplicationDbContext _db;

    public LessonService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> CreateAsync(Guid courseId, CreateLessonRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new InvalidOperationException("Title is required.");

        if (request.Order <= 0)
            throw new InvalidOperationException("Order must be greater than 0.");

        // Validate if the course already exist
        var courseExists = await _db.Courses.AnyAsync(c => c.Id == courseId, ct);
        if (!courseExists)
            throw new KeyNotFoundException("Course not found.");
        
        //before insert, validate unique order
        var orderExists = await _db.Lessons.AnyAsync(l => l.CourseId == courseId && l.Order == request.Order && !l.IsDeleted, ct);
        if (orderExists)
            throw new InvalidOperationException("Order must be unique within the course.");

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = request.Title.Trim(),
            Order = request.Order,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Lessons.Add(lesson);

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            //in case index is duplicated
            throw new InvalidOperationException("Order must be unique within the course.");
        }

        return lesson.Id;
    }

    public async Task SoftDeleteAsync(Guid lessonId, CancellationToken ct = default)
    {
        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId, ct);
        if (lesson is null)
            throw new KeyNotFoundException("Lesson not found.");

        lesson.IsDeleted = true;
        lesson.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task MoveUpAsync(Guid lessonId, CancellationToken ct = default)
    {
        // Reorder swap order with past lesson
    

        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId, ct);
        if (lesson is null)
            throw new KeyNotFoundException("Lesson not found.");

        var targetOrder = lesson.Order - 1;
        if (targetOrder < 1) return; 

        var other = await _db.Lessons
            .FirstOrDefaultAsync(l => l.CourseId == lesson.CourseId && l.Order == targetOrder, ct);

        if (other is null) return; 

        await SwapOrderAsync(lesson, other, ct);
    }

    public async Task MoveDownAsync(Guid lessonId, CancellationToken ct = default)
    {
        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId, ct);
        if (lesson is null)
            throw new KeyNotFoundException("Lesson not found.");

        var targetOrder = lesson.Order + 1;

        var other = await _db.Lessons
            .FirstOrDefaultAsync(l => l.CourseId == lesson.CourseId && l.Order == targetOrder, ct);

        if (other is null) return; 

        await SwapOrderAsync(lesson, other, ct);
    }

    private async Task SwapOrderAsync(Lesson a, Lesson b, CancellationToken ct)
    {
       
        using var trx = await _db.Database.BeginTransactionAsync(ct);

        const int tempOrder = -999999;

        var orderA = a.Order;
        var orderB = b.Order;

        a.Order = tempOrder;
        a.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        b.Order = orderA;
        b.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        a.Order = orderB;
        a.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        await trx.CommitAsync(ct);
    }
    
    public async Task<IReadOnlyList<LessonListItemDto>> GetByCourseAsync(Guid courseId, CancellationToken ct = default)
    {
        var courseExists = await _db.Courses.AnyAsync(c => c.Id == courseId, ct);
        if (!courseExists)
            throw new KeyNotFoundException("Course not found.");

        return await _db.Lessons
            .Where(l => l.CourseId == courseId && !l.IsDeleted)
            .OrderBy(l => l.Order)
            .Select(l => new LessonListItemDto(
                l.Id,
                l.CourseId,
                l.Title,
                l.Order,
                l.CreatedAt,
                l.UpdatedAt
            ))
            .ToListAsync(ct);
    }
    
    public async Task UpdateAsync(Guid lessonId, UpdateLessonRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new InvalidOperationException("Title is required.");

        if (request.Order <= 0)
            throw new InvalidOperationException("Order must be greater than 0.");

        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId, ct);
        if (lesson is null)
            throw new KeyNotFoundException("Lesson not found.");

        
        if (lesson.Order != request.Order)
        {
            var exists = await _db.Lessons.AnyAsync(
                l => l.CourseId == lesson.CourseId &&
                     l.Order == request.Order &&
                     l.Id != lesson.Id &&
                     !l.IsDeleted,
                ct);

            if (exists)
                throw new InvalidOperationException("Order must be unique within the course.");
        }

        lesson.Title = request.Title.Trim();
        lesson.Order = request.Order;
        lesson.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // en caso de carrera por índice único
            throw new InvalidOperationException("Order must be unique within the course.");
        }
    }

    
    
}
