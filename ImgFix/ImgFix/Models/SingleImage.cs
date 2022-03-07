using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ImgFix.Models
{
    public class SingleImage
    {
        public int id { get; set; }
        public string Name { get; set; }
        public string Mime { get; set; }
        public string Text { get; set; }
        public string Data { get; set; }

        public SingleImage(int id, string Name,string Mime, string Text, string Data)
        {
            this.id = id;
            this.Name = Name;
            this.Mime = Mime;
            this.Text = Text;
            this.Data = Data;

        }
    }
}