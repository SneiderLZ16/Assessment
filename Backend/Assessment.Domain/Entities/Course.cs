using Assessment.Domain.Enum;

namespace Assessment.Domain.Entities;

public class Course
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public CourseStatus Status { get; set; } = CourseStatus.Draft;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    //Relacion 1:N
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}