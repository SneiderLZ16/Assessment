using Assessment.Application.DTOs;
using Assessment.Domain.Enum;

namespace Assessment.Application.Services;

public interface ICourseService
{
    Task PublishAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default);
    Task UnpublishAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default);
    Task<PagedResult<CourseListItemDto>> SearchAsync(
        Guid currentUserId,
        CourseStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default);

    
    Task<Guid> CreateAsync(CreateCourseRequest request, Guid currentUserId, CancellationToken ct = default);
    Task<CourseSummaryDto> GetSummaryAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid courseId, Guid currentUserId, CancellationToken ct = default);
    Task UpdateAsync(Guid courseId, Guid currentUserId, UpdateCourseRequest request, CancellationToken ct = default);
    
}