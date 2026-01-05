using Assessment.Application.DTOs;

namespace Assessment.Application.Services;

public interface ILessonService
{
    Task<Guid> CreateAsync(Guid courseId, CreateLessonRequest request, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid lessonId, CancellationToken ct = default);

    Task MoveUpAsync(Guid lessonId, CancellationToken ct = default);
    Task MoveDownAsync(Guid lessonId, CancellationToken ct = default);
    Task<IReadOnlyList<LessonListItemDto>> GetByCourseAsync(Guid courseId, CancellationToken ct = default);
    Task UpdateAsync(Guid lessonId, UpdateLessonRequest request, CancellationToken ct = default);


}