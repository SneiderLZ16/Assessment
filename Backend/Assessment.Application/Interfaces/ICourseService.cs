using Assessment.Application.DTOs;
using Assessment.Domain.Enum;

namespace Assessment.Application.Services;

public interface ICourseService
{
    Task PublishAsync(Guid courseId, CancellationToken ct = default);
    Task UnpublishAsync(Guid courseId, CancellationToken ct = default);

    Task<PagedResult<CourseListItemDto>> SearchAsync(
        CourseStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<CourseSummaryDto> GetSummaryAsync(Guid courseId, CancellationToken ct = default);
    Task<Guid> CreateAsync(CreateCourseRequest request, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid courseId, CancellationToken ct = default);
    Task UpdateAsync(Guid courseId, UpdateCourseRequest request, CancellationToken ct = default);

}