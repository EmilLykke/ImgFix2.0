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
        public string Text { get; set; }
        public byte[] Data { get; set; }

        public SingleImage(int id, string Name, string Text, byte[] Data)
        {
            this.id = id;
            this.Name = Name;
            this.Text = Text;
            this.Data = Data;

        }
    }
}