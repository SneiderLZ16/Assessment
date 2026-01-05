using Microsoft.AspNetCore.Identity;

namespace Assessment.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Lastname { get; set; } = string.Empty;
}