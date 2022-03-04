using ImgFix.Models;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;


namespace ImgFix.Controllers
{
    public class HomeController : Controller
    {
        private readonly UserManager<AppUser> userManager;
        private ImgFixEntities db;
        public HomeController()
            : this(Startup.UserManagerFactory.Invoke())
        {
            this.db = new ImgFixEntities();
        }

        public HomeController(UserManager<AppUser> userManager)
        {
            this.db = new ImgFixEntities();
            this.userManager = userManager;
            
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && userManager != null)
            {
                db.Dispose();
                userManager.Dispose();
            }
            base.Dispose(disposing);
        }

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> LogIn(LogInModel model)
        {
            if (!ModelState.IsValid)
            {
                Response.StatusCode = 400;
                return Json("Invalid input");
            }

            var user = await userManager.FindAsync(model.Email, model.Password);

            if (user != null)
            {
                var identity = await userManager.CreateIdentityAsync(
                    user, DefaultAuthenticationTypes.ApplicationCookie);

                Request.GetOwinContext().Authentication.SignIn(identity);

                return Json("Success");
            }

            // user authN failed
            return Json("Invalid email or password");
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Register(RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                Response.StatusCode = 400;
                return Json("Invalid password or mail");
            }

            var user = new AppUser
            {
                UserName = model.Email,
            };

            var result = await userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await SignIn(user);
                return Json("Success");
            }

            Response.StatusCode = 400;
            string error = result.Errors.First();

            return Json(error);
        }

        private async Task SignIn(AppUser user)
        {
            var identity = await userManager.CreateIdentityAsync(
                user, DefaultAuthenticationTypes.ApplicationCookie);
            Request.GetOwinContext().Authentication.SignIn(identity);
        }

        [AllowAnonymous]
        public ActionResult LogOut()
        {
            var ctx = Request.GetOwinContext();
            var authManager = ctx.Authentication;

            authManager.SignOut("ApplicationCookie");
            return RedirectToAction("index", "home");
        }

        private string GetRedirectUrl(string returnUrl)
        {
            if (string.IsNullOrEmpty(returnUrl) || !Url.IsLocalUrl(returnUrl))
            {
                return Url.Action("index", "home");
            }

            return returnUrl;
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
        [AllowAnonymous]
        public ActionResult UploadImage(string name, string file, string type)
        {
            //Debug.WriteLine(file);
            //return Json("good");
            //Debug.WriteLine("name: " + name);
            //Debug.WriteLine("file: " +file);

            //Debug.WriteLine("type: " + type);
            string[] newFile = file.Split(',');
            Debug.WriteLine("base: " + newFile[1]);

            if (file != null)
            {
                //file.SaveAs(Server.MapPath("~/Images/" + file.FileName));


                


                string text = run_cmd(newFile[1], type);
                string total = "This is name: " + name + "\n" + "This is the output: " + text;

                Billeder billede = new Billeder();
                byte[] fileBytes = Convert.FromBase64String(newFile[1]);
                billede.Name = name;
                billede.Mime = name.Split('.')[1];
                billede.Data = fileBytes;
                billede.Tekst = text;
                string userID = User.Identity.GetUserId();
                billede.AspNetUser = db.AspNetUsers.First(x=>x.Id== userID);
               
                db.Billeders.Add(billede);
                db.SaveChanges();


                return Json(total);
            }
            else
            {
                return Json("No file");
            }
        }
        private string run_cmd(string base64string, string type)
        {
            string output = "";
           
            string myTempFile = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(Path.GetRandomFileName()));
            using (StreamWriter sw = new StreamWriter(myTempFile))
            {
                Debug.WriteLine(myTempFile);
                sw.WriteLine(base64string);
                sw.Flush();
                sw.Close();
            }
            ProcessStartInfo start = new ProcessStartInfo();
            Directory.GetCurrentDirectory();
            start.FileName = "python";
            if (type == "adaptive")
            {
                start.Arguments = (Server.MapPath("~/Images/imageFix1.py")) + " " + myTempFile;
            }
            else
            {
                start.Arguments = (Server.MapPath("~/Images/imageFix2.py")) + " " + myTempFile;
            }
            
            Debug.WriteLine(start.Arguments);
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