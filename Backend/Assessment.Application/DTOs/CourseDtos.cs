using Assessment.Domain.Enum;

namespace Assessment.Application.DTOs;

public record CourseListItemDto(
    Guid Id,
    string Title,
    CourseStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int TotalLessons
);

public record CourseSummaryDto(
    Guid Id,
    string Title,
    CourseStatus Status,
    int TotalLessons,
    DateTime LastModification
);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount
);