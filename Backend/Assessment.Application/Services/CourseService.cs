using Assessment.Application.DTOs;
using Assessment.Domain.Entities;
using Assessment.Domain.Enum;
using Assessment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Assessment.Application.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _db;

    public CourseService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task PublishAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default)
    {
        var course = await _db.Courses
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted, ct);

        if (course is null)
            throw new KeyNotFoundException("Course not found.");

        if (course.CreatedByUserId != currentUserId)
            throw new UnauthorizedAccessException("You do not have permission to publish this course.");

        var hasActiveLesson = await _db.Lessons
            .AnyAsync(l => l.CourseId == courseId && !l.IsDeleted, ct);

        if (!hasActiveLesson)
            throw new InvalidOperationException("Cannot publish a course without at least one active lesson.");

        course.Status = CourseStatus.Published;
        course.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task UnpublishAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default)
    {
        var course = await _db.Courses
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted, ct);

        if (course is null)
            throw new KeyNotFoundException("Course not found.");

        if (course.CreatedByUserId != currentUserId)
            throw new UnauthorizedAccessException("You do not have permission to unpublish this course.");

        course.Status = CourseStatus.Draft;
        course.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task<PagedResult<CourseListItemDto>> SearchAsync(
        CourseStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = _db.Courses.AsQueryable();
        

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var total = await query.CountAsync(ct);

        //TotalLessons
        var items = await query
            .OrderByDescending(c => c.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CourseListItemDto(
                c.Id,
                c.Title,
                c.CourseDescription,
                c.Status,
                c.CreatedAt,
                c.UpdatedAt,
                _db.Lessons.Count(l => l.CourseId == c.Id && !l.IsDeleted)
            ))
            .ToListAsync(ct);

        return new PagedResult<CourseListItemDto>(items, page, pageSize, total);
    }

    public async Task<CourseSummaryDto> GetSummaryAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default)
    {
        var course = await _db.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted, ct);

        if (course is null)
            throw new KeyNotFoundException("Course not found.");

        var canView = course.Status == CourseStatus.Published || course.CreatedByUserId == currentUserId;

        if (!canView)
            throw new UnauthorizedAccessException("You do not have permission to view this course.");

        var totalLessons = await _db.Lessons
            .CountAsync(l => l.CourseId == courseId && !l.IsDeleted, ct);

        var lastLessonUpdate = await _db.Lessons
            .Where(l => l.CourseId == courseId && !l.IsDeleted)
            .Select(l => (DateTime?)l.UpdatedAt)
            .OrderByDescending(d => d)
            .FirstOrDefaultAsync(ct);

        var lastModification = course.UpdatedAt;
        if (lastLessonUpdate.HasValue && lastLessonUpdate.Value > lastModification)
            lastModification = lastLessonUpdate.Value;

        return new CourseSummaryDto(
            course.Id,
            course.Title,
            course.CourseDescription,
            course.Status,
            totalLessons,
            lastModification
        );
    }
    
    public async Task<Guid> CreateAsync(CreateCourseRequest request, Guid currentUserId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new InvalidOperationException("Title is required.");
        
        if (string.IsNullOrWhiteSpace(request.Description))
            throw new InvalidOperationException("Description is required.");
        
        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            CourseDescription = request.Description.Trim(),
            Status = CourseStatus.Draft,
            CreatedByUserId = currentUserId,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync(ct);

        return course.Id;
    }

    public async Task SoftDeleteAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default)
    {
        var course = await _db.Courses
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted, ct);

        if (course is null)
            throw new KeyNotFoundException("Course not found.");

        if (course.CreatedByUserId != currentUserId)
            throw new UnauthorizedAccessException("You do not have permission to delete this course.");

        course.IsDeleted = true;
        course.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Guid courseId, Guid currentUserId, UpdateCourseRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new InvalidOperationException("Title is required.");

        var course = await _db.Courses
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted, ct);

        if (course is null)
            throw new KeyNotFoundException("Course not found.");

        if (course.CreatedByUserId != currentUserId)
            throw new UnauthorizedAccessException("You do not have permission to update this course.");

        course.Title = request.Title.Trim();
        course.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }
    public async Task<PagedResult<CourseListItemDto>> SearchAsync(
        Guid currentUserId,
        CourseStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = _db.Courses
            .Where(c => !c.IsDeleted)
            .Where(c => c.Status == CourseStatus.Published || c.CreatedByUserId == currentUserId);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CourseListItemDto(
                c.Id,
                c.Title,
                c.CourseDescription,
                c.Status,
                c.CreatedAt,
                c.UpdatedAt,
                _db.Lessons.Count(l => l.CourseId == c.Id && !l.IsDeleted)
            ))
            .ToListAsync(ct);

        return new PagedResult<CourseListItemDto>(items, page, pageSize, total);
    }
    
}
