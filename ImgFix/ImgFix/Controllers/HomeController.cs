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
        //Vores UserManager, til at håndtere brugere
        private readonly UserManager<AppUser> userManager;

        //Vores db entity (EntityFramework)
        private ImgFixEntities db;

        /*Første Constructor, invoker UserManager fra Startup.cs og kalder
        anden constructor med UserManager som argument*/
        public HomeController()
            : this(Startup.UserManagerFactory.Invoke())
        {
            this.db = new ImgFixEntities();
        }

        /*Tager usermanager som argumenter og sætter db og usermanager
        properties i klassen til en db entity og den userManager som
        den fik som argument*/
        public HomeController(UserManager<AppUser> userManager)
        {
            this.db = new ImgFixEntities();
            this.userManager = userManager;

        }

        /*En standard controller metode, som bliver kaldt nå 
        controlleren er færdig med sit job. Disposer vores
        database og usermanager entity*/
        protected override void Dispose(bool disposing)
        {
            if (disposing && userManager != null)
            {
                db.Dispose();
                userManager.Dispose();
            }
            base.Dispose(disposing);
        }

        /*Hjem ruten, må tilgåes uden login, alle andre ruter kræver login medmindre
        [AllowAnonymous] fremgår*/
        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }


        /*Dette er vores post login metode, den tager
        et objekt af klassen LogInModel som argument*/
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> LogIn(LogInModel model)
        {
            //Hvis inputargumenterne ikke er valide (et input mangler)
            if (!ModelState.IsValid)
            {
                /*Retuner fejl, igennem hele hjemmesiden sætter vi 
                statuskoden på responsen til en fejlkode, når en fejl opstår.
                På den måde ved Javascript ved klient at der er sket en fejl*/
                Response.StatusCode = 400;
                return Json("Invalid input");
            }

            //Prøv at finde en bruger med givne mail og password i model, ved hjælp af UM
            var user = await userManager.FindAsync(model.Email, model.Password);

            //Hvis vi kunne finde en bruger
            if (user != null)
            {
                /*Skab en midlertidig identitet som repræsentere brugeren.
                Denne identit er kun valid i denne session. Sæt identiteten over i
                variablen identity*/
                var identity = await userManager.CreateIdentityAsync(
                    user, DefaultAuthenticationTypes.ApplicationCookie);

                //Sætter den rigtige cookie, så Identity kan genkende brugeren
                Request.GetOwinContext().Authentication.SignIn(identity);

                //Retuner success til JS
                return Json("Success");
            }

            //Ingen bruger fundet, retuner fejl
            Response.StatusCode = 400;
            return Json("Invalid email or password");
        }

        /*Dette er vores registrerings metode, den tager et objekt
        af klassen RegisterModel som argument.*/
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Register(RegisterModel model)
        {
            //Hvis korrekte input
            if (!ModelState.IsValid)
            {
                Response.StatusCode = 400;
                return Json("Invalid password or mail");
            }

            /*Lav et nyt objekt af klassen appuser,
            husk at AppUser inheriter IdentityUser.
            Vi sætter email til givne email*/
            var user = new AppUser
            {
                UserName = model.Email,
            };

            //Skab en ny bruger med password og email.
            var result = await userManager.CreateAsync(user, model.Password);

            //hvis det lykkedes at skabe en ny bruger
            if (result.Succeeded)
            {
                //Vi logger brugeren ind på samme måde som ovenfor.
                await SignIn(user);
                //Retuner success
                return Json("Success");
            }

            //Ellers retunere vi en fejl, med hvorfor det gik galt.
            Response.StatusCode = 400;
            string error = "";
            error += result.Errors.First();

            return Json(error);
        }

        //Blot en metode, med samme funktionalitet som sidste del af Login()
        private async Task SignIn(AppUser user)
        {
            var identity = await userManager.CreateIdentityAsync(
                user, DefaultAuthenticationTypes.ApplicationCookie);
            Request.GetOwinContext().Authentication.SignIn(identity);
        }

        //Bliver kaldt når en bruger søger efter andre brugere
        //retunere en liste over resultater og tager en string
        //med søgningen som argument
        [HttpPost]
        public ActionResult SearchPeople(string query)
        {
            //Find brugere (AspNetUsers) hvor brugernavnet indeholdet søgningen
            IEnumerable<AspNetUser> people = db.AspNetUsers.Where(e => e.UserName.Contains(query)).AsEnumerable();

            //Hvis listen indeholder nogle personer
            if(people.Any())
            {
                //Indsæt disse personer i et objekt af modelklassen UserSearchResult
                UserSearchResult Users = new UserSearchResult(people);
                //Konverter dette objekt til json
                var json = JsonConvert.SerializeObject(Users);
                //Retuner dette objekt
                return Json(Users);
            } else
            {
                //Hvis ingen personer i listen retuner fejl
                Response.StatusCode = 400;
                return Json("empty");   
            }
        }

        //Metoden til at fjerne en deling, tager shareId som argument
        [HttpPost]
        public ActionResult DelShare(int id)
        {
            //Få brugeren der kalder denne rutes id
            string currentId = User.Identity.GetUserId();
            /*Hvis en deling med ovenstående id, hvor ovenstående bruger er ejer 
            eller billedet er delt med vedkommende, eksitere*/
            if (db.Shares.Where(e => e.ownerId == currentId || e.shareId == currentId).Any())
            {
                //Find den deling i databasen som brugeren vil slette
                Share deling = db.Shares.First(e => e.ownerId == currentId || e.shareId == currentId);
                //fjern denne share fra db og gem ændringer, retuner ok
                db.Shares.Remove(deling);
                db.SaveChanges();
                return Json("ok");
            } else
            {
                //Ellers retuner fejl, fordi brugeren givetvis ikke har adgang til billedet
                Response.StatusCode = 403;
                return Json("You do not have access to this image");
            }
        }

        /*Denne funktion tilføjer en deling, den tager
        id på billede som skal deles og id på brugeren som billedet
        skal deles med som argumenter*/
        [HttpPost]
        public ActionResult AddShare(int imgId, string userId)
        {
            //Få fat i nuværende brugers id
            string currentId = User.Identity.GetUserId();
            //Få brugernavn på brugeren som billedet skal deles med
            string username = db.AspNetUsers.First(e => e.Id == userId).UserName;
            /*Find det billede som enten er delt eller ejet af nuværende bruger 
            og har det rigtige billedeid som vi søger efter*/ 
            Billeder Billede = db.Billeders.FirstOrDefault(e => (e.UserId == currentId || e.Shares.Any(x => x.shareId == currentId)) && e.id == imgId);
            //Hvis sådan et billede eksistere i datbasen
            if (Billede != null)
            {
                //Hvis brugeren som billedet skal deles med allerede har adgang til dette billede, retunere vi en fejl
                if(db.Billeders.Where(e => (e.UserId == userId || e.Shares.Any(x => x.shareId == userId)) && e.id == imgId).Any())
                {
                    Response.StatusCode = 500;
                    return Json("This person already have access to this image");
                } else
                {
                    //Ellers opretter vi en ny deling i databasen og gemmer denne
                    //grundet til at vi fandt brugernavnet på personen billedet deles med,
                    //er at vi skal sende det tilbage til klienten, så det kan blive vist på siden
                    Share deling = db.Shares.Add(new Share { shareId = userId, billedeId = imgId, ownerId = currentId });
                    db.SaveChanges();
                    return Json(new { id = deling.id, username = username });
                }
            } else
            {
                //Ellers retuner fejl
                Response.StatusCode = 403;
                return Json("No access to any image with given id");
            }
        }

        //Denne metode bruges til at tilgå detaljerne til et billede, tager billedets id som argument
        [HttpPost]
        public ActionResult ImageDetails(int? id) {
            //Find nuværende brugers id
            var userId = User.Identity.GetUserId();
            //Find det billede som har givne id, og nuværende bruger har adgang til.
            Billeder billede = db.Billeders.DefaultIfEmpty(null).FirstOrDefault(e => e.id == id && (e.UserId == userId || e.Shares.Any(x => x.shareId == userId)));
            //Hvis sådan et billede eksistere
            if(billede != null)
            {
                //Lav nyt objekt af modelklassen ImageDetails
                ImageDetails detaljer = new ImageDetails(billede);
                //retuner dette objekt som JSON
                return Json(detaljer);
            }
            else
            {
                //Elers retuner fejl
                Response.StatusCode = 404;
                return Json("No image with given id");
            }
        }

        //Denne metode logger blot brugeren ud
        // Home/LogOut
        [AllowAnonymous]
        public ActionResult LogOut()
        {
            //Få OWin konteksten
            var ctx = Request.GetOwinContext();
            //Få Authenticationmanager fra Owin
            var authManager = ctx.Authentication;

            //Login brugeren ud (Fjern cookien)
            authManager.SignOut("ApplicationCookie");

            //Send til hjem-siden
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

        //Vores billede side, når et billede er blevet uploadet. Tager et billedeid som argument
        public ActionResult Image(int id)
        {
            //Find nuværende brugers id
            var userId = User.Identity.GetUserId();
            //Find det billede som har givne id, og nuværende bruger har adgang til.
            Billeder billede = db.Billeders.DefaultIfEmpty(null).FirstOrDefault(e => e.id == id && (e.UserId == userId || e.Shares.Any(x => x.shareId == userId)));
            //Hvis sådan et billede eksistere
            if (billede != null)
            {
                ViewBag.Message = "Your application description page.";
                //Retuner view med et objekt af klassen SingleImage som view model.
                return View(new SingleImage(billede.id, billede.Name, billede.Mime, billede.Tekst, Convert.ToBase64String(billede.Data)));
            }
            else
            {
                //Elers retuner til hjem-side
                return RedirectToAction("index", "home");
            }         
        }

        //Mine billeder siden, viser alle brugerens billeder
        public ActionResult MyImages()
        {
            //Find nuværende brugerid
            var userID = User.Identity.GetUserId();
            //Find alle billeder i databasen som brugeren har adgang til, dvs. ejerskab og deling.
            IQueryable<Billeder> billeder = db.Billeders.Where(x => x.UserId == userID || x.Shares.Any(e => e.shareId == userID));
            //Retuner view med IQueryable<Billeder> som model
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
         
            //Hvis alle argumenter er til stede, ellers retunere vi fejl
            if (file != null && name != null && type != null)
            {
                //Splitter base64 string ved , . data:image/png;base64,REELTBILLEDE
                string[] newFile = file.Split(',');
                string text = "";
                //Prøv at læs teksten i et try catch statement
                try
                {
                    //Run cmd kører Python script, og extracter teksten
                   text = run_cmd(newFile[1], type);
                }
                catch (Exception e)
                {
                    //Hvis fejl retuner fejl
                    Response.StatusCode = 500;
                    return Json(e.Message);
                }

                //Hvis der ikke er tekst i billedet retunere vi fejl
                if(string.IsNullOrEmpty(text.Trim()))
                {
                    Response.StatusCode = 501;
                    return Json("No text in image");
                }

                //Opret et nyt objekt af klassen billeder, som repræsentere vores billede table i db
                //Indsæt alle data i dette objekt, og gem billedet i databasen
                Billeder billede = new Billeder();
                byte[] fileBytes = Convert.FromBase64String(newFile[1]);
                billede.Name = name;
                billede.Mime = newFile[0];
                billede.Data = fileBytes;

                billede.Tekst = text;
                billede.UserId = User.Identity.GetUserId();
               
                db.Billeders.Add(billede);
                db.SaveChanges();

                //Retuner billedets id.
                return Json(billede.id);
            }
            else
            {
                Response.StatusCode = 40;
                return Json("No file");
            }
        }

        /*Denne funktion retunere tekst i billede, og tager 
        et billede som base64 og OCR typen som argument*/
        private string run_cmd(string base64string, string type)
        {
            string output = "";
            
            //Opret tilfældig filsti i tempmappen på serveren.
            string myTempFile = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(Path.GetRandomFileName()));

            //Skriv base64 string ned i denne fil.
            using (StreamWriter sw = new StreamWriter(myTempFile))
            {
                Debug.WriteLine(myTempFile);
                sw.WriteLine(base64string);
                sw.Flush();
                sw.Close();
            }

            /*Her opretter vi et objekt af klassen processstartinfo,
             dette objekt indeholder information til C#, omrking
            det program som det skal køre. I dette tilfælde python*/
            ProcessStartInfo start = new ProcessStartInfo();

            //Svare til at skrive "python" i cmd
            start.FileName = "python";

            /*Der er to scripts et til adaptive og et uden
            ellers er de identiske. Disse scripts kan findes i Images mappen*/
            
            //Vi sætter startargumentet til scriptest sti på serveren + filen med billedets sti.
            if (type == "adaptive")
            {
                start.Arguments = (Server.MapPath("~/Images/imageFix1.py")) + " " + myTempFile;
            }
            else
            {
                start.Arguments = (Server.MapPath("~/Images/imageFix2.py")) + " " + myTempFile;
            }
            //Andre indstillinger til processen
            start.UseShellExecute = false;
            start.RedirectStandardOutput = true;
            start.RedirectStandardError = true;
            start.CreateNoWindow = true;
            
            //Vi bruger using for at Process og streamreader automatisk bliver disposed
            /*Her starter vi Python programmet og bruger StreamReader til at læse
            programmets output. En c# process har to output, error og normal.
            Vi kigger om error output har outputtet noget, i så fald thrower vi en 
            exception*/
            
            using (Process process = Process.Start(start))
            {
                using (StreamReader reader = process.StandardError)
                {
                    string error = reader.ReadToEnd();
                    //hvis noget fejltekst, throw fejl. Bliver sendt til klient
                    if(error != "")
                        throw new Exception(error);
                }
                using (StreamReader reader = process.StandardOutput)
                {
                    //Hvis alt er ok, sætter vi output til python respons.
                    //dette repræsentere teksten i billedet
                    output = reader.ReadToEnd();
                    Debug.WriteLine(output);
                }
            }
            //Retuner output.
            return output;
        }
    }
}