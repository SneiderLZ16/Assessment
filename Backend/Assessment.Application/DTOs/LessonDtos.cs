namespace Assessment.Application.DTOs;

public record LessonListItemDto(
    Guid Id,
    Guid CourseId,
    string Title,
    string Description,
    int Order,
    DateTime CreatedAt,
    DateTime UpdatedAt
);