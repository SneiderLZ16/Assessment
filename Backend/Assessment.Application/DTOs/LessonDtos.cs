namespace Assessment.Application.DTOs;

public record LessonListItemDto(
    Guid Id,
    Guid CourseId,
    string Title,
    int Order,
    DateTime CreatedAt,
    DateTime UpdatedAt
);