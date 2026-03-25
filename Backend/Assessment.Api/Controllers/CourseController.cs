using Assessment.Application.DTOs;
using Assessment.Application.Services;
using Assessment.Domain.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assessment.Api.Controllers;

[ApiController]
[Route("api/courses")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    private bool TryGetCurrentUserId(out Guid currentUserId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdValue, out currentUserId);
    }
    
    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpPatch("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
    {
        try
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized(new { message = "Invalid user token." });

            await _courseService.PublishAsync(id, currentUserId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/unpublish")]
    public async Task<IActionResult> Unpublish(Guid id, CancellationToken ct)
    {
        try
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized(new { message = "Invalid user token." });

            await _courseService.UnpublishAsync(id, currentUserId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] CourseStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var currentUserId))
            return Unauthorized(new { message = "Invalid user token." });

        var result = await _courseService.SearchAsync(currentUserId, status, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/summary")]
    public async Task<IActionResult> Summary(Guid id, CancellationToken ct)
    {
        try
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized(new { message = "Invalid user token." });

            var summary = await _courseService.GetSummaryAsync(id, currentUserId, ct);
            return Ok(summary);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });        }
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request, CancellationToken ct)
    {
        try
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var currentUserId))
                return Unauthorized(new { message = "Invalid user token." });

            var id = await _courseService.CreateAsync(request, currentUserId, ct);
            return CreatedAtAction(nameof(Summary), new { id }, new { id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> SoftDelete(Guid id, CancellationToken ct)
    {
        try
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized(new { message = "Invalid user token." });

            await _courseService.SoftDeleteAsync(id, currentUserId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex )
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });        }
    }

    
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourseRequest request, CancellationToken ct)
    {
        try
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized(new { message = "Invalid user token." });

            await _courseService.UpdateAsync(id, currentUserId, request, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
