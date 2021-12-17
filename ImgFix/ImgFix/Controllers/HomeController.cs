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
            return View(imag);
        }
        private string run_cmd()
        {
           
            var outPutDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().CodeBase);
            var fileName = Path.Combine(outPutDirectory, "Images\\imageFix.py");
            string file_Name = new Uri(fileName).LocalPath;


            Process p = new Process();
            p.StartInfo = new ProcessStartInfo(@"C:\Python27\python.exe", file_Name)
            {
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            p.Start();

            string output = p.StandardOutput.ReadToEnd();
            p.WaitForExit();

            return output;




        }
    }
}