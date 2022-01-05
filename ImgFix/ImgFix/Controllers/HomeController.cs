using ImgFix.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

namespace ImgFix.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Image()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult MyImages()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [HttpPost]
        public ActionResult Index(ImgTBF image)
        {

            
            ImgTBF imag = new ImgTBF();
            imag.name = run_cmd();
            ViewData["Message"] = imag.name;
            return Json(imag);
        }
        private string run_cmd()
        {
            string output = "";
            ProcessStartInfo start = new ProcessStartInfo();
            Directory.GetCurrentDirectory();
            start.FileName = "python";
            start.Arguments = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Images\\imageFix.py");
            Debug.WriteLine(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Images\\imageFix.py"));
            start.UseShellExecute = false;
            start.RedirectStandardOutput = true;
            start.RedirectStandardError = true;
            start.CreateNoWindow = true;

            using (Process process = Process.Start(start))
            {
                using (StreamReader reader = process.StandardError)
                {
                    string error = reader.ReadToEnd();
                    Debug.WriteLine("Error: " + error);
                }
                using (StreamReader reader = process.StandardOutput)
                {
                    output = reader.ReadToEnd();
                    Debug.WriteLine(output);
                }
            }
            return output;




        }
    }
}