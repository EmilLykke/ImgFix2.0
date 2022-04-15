using ImgFix.Models;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
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
using System.Web.Routing;

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
            Response.StatusCode = 400;
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
            Debug.WriteLine(error);

            return Json(error);
        }
        [HttpPost]
        public ActionResult SearchPeople(string query)
        {
            IEnumerable<AspNetUser> people = db.AspNetUsers.Where(e => e.UserName.Contains(query)).AsEnumerable();
            if(people.Any())
            {
                UserSearchResult Users = new UserSearchResult(people);
                var json = JsonConvert.SerializeObject(Users);
                return Json(Users);
            } else
            {
                Response.StatusCode = 400;
                return Json("empty");   
            }
        }
        [HttpPost]
        public ActionResult DelShare(int id)
        {
            string currentId = User.Identity.GetUserId();
            if(db.Shares.Where(e => e.ownerId == currentId || e.shareId == currentId).Any())
            {
                Share deling = db.Shares.First(e => e.ownerId == currentId || e.shareId == currentId);
                db.Shares.Remove(deling);
                db.SaveChanges();
                return Json("ok");
            } else
            {
                Response.StatusCode = 403;
                return Json("You do not have access to this image");
            }
        }

        [HttpPost]
        public ActionResult AddShare(int imgId, string userId)
        {
            string currentId = User.Identity.GetUserId();
            string username = db.AspNetUsers.First(e => e.Id == userId).UserName;
            Billeder Billede = db.Billeders.FirstOrDefault(e => (e.UserId == currentId || e.Shares.Any(x => x.shareId == currentId)) && e.id == imgId);
            if (Billede != null)
            {
                if(db.Billeders.Where(e => (e.UserId == userId || e.Shares.Any(x => x.shareId == userId)) && e.id == imgId).Any())
                {
                    Response.StatusCode = 500;
                    return Json("This person already have access to this image");
                } else
                {
                    Share deling = db.Shares.Add(new Share { shareId = userId, billedeId = imgId, ownerId = currentId });
                    db.SaveChanges();
                    return Json(new { id = deling.id, username = username });
                }
            } else
            {
                Response.StatusCode = 403;
                return Json("No access to any image with given id");
            }
        }


        [HttpPost]
        public ActionResult ImageDetails(int? id) {
            var userId = User.Identity.GetUserId();
            Billeder billede = db.Billeders.DefaultIfEmpty(null).FirstOrDefault(e => e.id == id && (e.UserId == userId || e.Shares.Any(x => x.shareId == userId)));
            if(billede != null)
            {
                Models.ImageDetails detaljer = new Models.ImageDetails(billede);
                return Json(detaljer);
            }
            else
            {
                Response.StatusCode = 404;
                return Json("No image with given id");
            }
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

        public ActionResult Image(int id)
        {

            Billeder billede = db.Billeders.FirstOrDefault(x => x.id == id);

            
            ViewBag.Message = "Your application description page.";
         
            return View(new SingleImage(billede.id, billede.Name,billede.Mime, billede.Tekst, Convert.ToBase64String(billede.Data)));
        }

        public ActionResult MyImages()
        {
            var userID = User.Identity.GetUserId();
            IQueryable<Billeder> billeder = db.Billeders.Where(x => x.UserId == userID || x.Shares.Any(e => e.shareId == userID));
            return View(billeder);
        }

        [HttpPost]
        public ActionResult GetDetalils(int id)
        {
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



                string text = "";
                try
                {
                   text = run_cmd(newFile[1], type);
                }
                catch (Exception e)
                {
                    Response.StatusCode = 500;
                    return Json(e.Message);
                }

                if(string.IsNullOrEmpty(text.Trim()))
                {
                    Response.StatusCode = 501;
                    return Json("Der mangler tekst i billedet");
                }

                string total = "This is name: " + name + "\n" + "This is the output: " + text;

                Billeder billede = new Billeder();
                byte[] fileBytes = Convert.FromBase64String(newFile[1]);
                billede.Name = name;
                billede.Mime = newFile[0];
                billede.Data = fileBytes;

                billede.Tekst = text;
                billede.UserId = User.Identity.GetUserId();
               
                db.Billeders.Add(billede);
                db.SaveChanges();

                return Json(billede.id);

                
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
                    if(error != "")
                        throw new Exception(error);

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