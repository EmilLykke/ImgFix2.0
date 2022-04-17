using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImgFix.Models
{
    public class ImageDetails
    {
        public string name { get; set; }
        public int bytes { get; set; }
        public int id { get; set; }
        public string ownerId { get; set; }
        public List<ImageShare> shares { get; set; }
        public List<ImageMessage> messages { get; set; }
        public ImageDetails(Billeder billede)
        {
            this.shares = new List<ImageShare>();
            this.messages = new List<ImageMessage>();
            this.name = billede.Name;
            this.id = billede.id;
            this.bytes = billede.Data.Length;
            this.ownerId = billede.UserId;
            foreach (Share share in billede.Shares)
            {   
                this.shares.Add(new ImageShare(share.AspNetUser.UserName, share.ownerId, share.id));
            }
            foreach (Message message in billede.Messages)
            {
                this.messages.Add(new ImageMessage(message.id, message.AspNetUser.UserName, message.userId, message.message1));
            }
        }
    }

    public class ImageShare
    {
        public int id { get; set; }
        public string username { get; set; }
        public string userId { get; set; }
        public ImageShare(string username, string userId, int id)
        {
            this.username = username;
            this.userId = userId;
            this.id = id;
        }
    }

    public class ImageMessage
    {
        public int id { get; set; }
        public string username { get; set; }
        public string userId { get; set; }
        public string message { get; set; }
        public ImageMessage(int id, string username, string userId, string message)
        {
            this.id = id;
            this.username = username;
            this.userId = userId;
            this.message = message;
        }
    }
}
