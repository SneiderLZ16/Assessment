using Assessment.Application.DTOs;
using Assessment.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assessment.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonsController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    
    [HttpPost("courses/{courseId:guid}/lessons")]
    public async Task<IActionResult> Create(Guid courseId, [FromBody] CreateLessonRequest request, CancellationToken ct)
    {
        try
        {
            var id = await _lessonService.CreateAsync(courseId, request, ct);
            return Ok(new { id });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    
    [HttpDelete("lessons/{id:guid}")]
    public async Task<IActionResult> SoftDelete(Guid id, CancellationToken ct)
    {
        try
        {
            await _lessonService.SoftDeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    
    [HttpPatch("lessons/{id:guid}/move-up")]
    public async Task<IActionResult> MoveUp(Guid id, CancellationToken ct)
    {
        try
        {
            await _lessonService.MoveUpAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    
    [HttpPatch("lessons/{id:guid}/move-down")]
    public async Task<IActionResult> MoveDown(Guid id, CancellationToken ct)
    {
        try
        {
            await _lessonService.MoveDownAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    
    
    [HttpGet("courses/{courseId:guid}/lessons")]
    public async Task<IActionResult> GetByCourse(Guid courseId, CancellationToken ct)
    {
        try
        {
            var lessons = await _lessonService.GetByCourseAsync(courseId, ct);
            return Ok(lessons);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    
    [HttpPut("lessons/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLessonRequest request, CancellationToken ct)
    {
        try
        {
            await _lessonService.UpdateAsync(id, request, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }


}
