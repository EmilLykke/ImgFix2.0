using Microsoft.AspNet.Identity.EntityFramework;

namespace ImgFix
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext()
            : base("Auth")
        {
        }
    }
}