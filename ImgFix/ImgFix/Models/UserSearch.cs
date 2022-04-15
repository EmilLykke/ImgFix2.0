using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImgFix.Models
{
    public class UserSearchResult
    {
        public List<UserSearch> Users { get; set; }
        public UserSearchResult(IEnumerable<AspNetUser> Users)
        {
            this.Users = new List<UserSearch>();
            foreach (var user in Users)
            {
                Debug.WriteLine(user.UserName);
                UserSearch UserSearch = new UserSearch(user);
                this.Users.Add(UserSearch);
            }
        }
    }
    public class UserSearch
    {
        public string email { get; set; }
        public string id { get; set; }
        public UserSearch(AspNetUser user)
        {
            this.email = user.UserName;
            this.id = user.Id;
        }
    }
}
