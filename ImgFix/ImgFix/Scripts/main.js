//Når siden er loadet
$(document).ready(function () {
    //Når upload knappen klikkes, tjek om logget ind og klik file selector input.
    $("#uploadButton1").click(function () {
        if (isRequestAuthenticated) {
            $("#imagePicker1").click();
        } else {
            error("Please login", "Please login to upload an image.")
        }
    })
    //UI Respons når brugersøgeinput er i fokus, hvis resultatliste
    $(".image-details .sharing .search input").focus(function () {
        var result = $(".image-details .sharing .search .search-result")
        result.find(".person").remove()
        result.find(".loader-wrapper").hide()
        result.find(".no-results").show()
    })
    //Når en knap klikkes inde i brugersøgefelt
    $(".image-details .sharing .search input").keyup(async function () {
        //Få input værdi, vis loader og skjul ingen resultat.
        var val = $(".image-details .sharing .search input").val()
        var result = $(".image-details .sharing .search .search-result")
        result.find(".loader-wrapper").show()
        result.find(".no-results").hide()
        //Kald searchpeople ruten med fetch
        fetch("/Home/SearchPeople", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            //Vores søge query
            body: JSON.stringify({ query: val })
        })
        //Tjek om respons status er ok, ellers throw fejl.
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response
        })
        //Omdan respons fra JSON til et objekt
        .then(response => response.json())
            .then(data => {
            /*Skjul loader og fjern forrige resultater.
            For hvert resultat tilhøj HTML for en person
            så personen vises*/
            result.find(".loader-wrapper").hide()
            result.find(".person").remove()
            result.find(".no-results").hide()
            for (var i = 0; i < data.Users.length; i++) {
                user = data.Users[i]
                var text = `<div class="person" onmousedown="AddShare(${$(".image-details").data("id")}, '${user.id}')"><div class="initials"><h1>${user.email[0].toUpperCase()}</h1><p>${user.email}</p></div></div>`
                result.append(text)
            }
            })
            //Hvis fejl giv brugeren besked
            .catch((error) => {
            console.log(error)
            result.find(".person").remove()
            result.find(".loader-wrapper").hide()
            result.find(".no-results").show()
        })
    })
    //Håndtering af klik på søgeresultat
    $(".image-details .sharing .search .person").mousedown(function (e) {
        e.stopImmediatePropagations
        e.preventDefault();
    })
});

$(document).ready(function () {
    /*Her håndteres klik på adaptive knap, så man kan uploade billede med denne
     samt når man trykker enter i login eller signup modal, for at send request*/
    $("#uploadButton2").click(function () {
        if (isRequestAuthenticated) {
            $("#imagePicker2").click();
        } else {
            error("Please login", "Please login to upload an image.")
        }
    })
    $('.signinmodal input').keypress(function (e) {
        if (e.which == 13) {
            $('.signinmodal button').click();
        }
    });
    $('.signupmodal input').keypress(function (e) {
        if (e.which == 13) {
            $('.signupmodal button').click();
        }
    });
});

//Dette er blot en generisk funktion som kan vise en fejl
//den tager en titel og besked som input, og viser en fejl på brugerens skærm
//let måde at håndtere fejl på
function error(title, message) {
    var elem = $("<div class='error' style='transform: translateX(330px)'><div class='errorcontent'><p class='errortitle'>" + title + "</p><p class='errormessage'>" + message + "</p></div ><div class='errorbar'></div></div >").appendTo("#error-section")
    //Vent 3 sek før fejl forsvinder
    setTimeout(function () {
        elem.css('transform', 'translateX(0)')
        elem.find(".errorbar").css('width', '0px')
        setTimeout(function () {
            //Slide ud
            elem.css('transform', 'translateX(330px)')
            setTimeout(function () {
                elem.remove()
            }, 200)
        }, 3000)
    }, 50)
}

//Bruges til at downloade et billede fra MyImages siden
function downloadMyImage(element) {
    //Dataen ligger allerede på siden, fordi billdet jo bliver vist. 
    //Find tag med klassen image-data
    var imageData = element.closest(".image").find(".image-data")
    //Opret et a tag
    var a = document.createElement("a"); 
    a.href = imageData.attr("src") // Sæt a's href til billedets src (som er en base64 string)
    a.download = imageData.data("name") //Sæt navnet på a's indhold til billedets navn
    a.click(); //Download billedet (a's indhold)
}

//Denne funktion henter detaljerne for et billede, tager id som input
//Denne funktion minder emget om søg brugere funktionen
async function imageDetails(id) {
    var details = $(".image-details")
    details.find(".main-details").hide();
    details.find(".details-loader").show()
    details.find(".owner").remove();
    details.css("transform", "translateX(100%)")
    details.show();
    $(".image-details").data("id", id) //Sæt divens data-id til billedets id, til senere brug
    details.css("transform", "")
    var ids = parseInt(id);
    //Kald post til /ImageDetails
    fetch("/Home/ImageDetails", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        //Billede id som body
        body: JSON.stringify({id: ids})
    })
    //Respons parses som Json
    .then(response => response.json())
        .then(data => {
        //Indsæt filstørrelse, billedenavn og delte brugere de rigtige steder
        details.find(".top-info-text h1").text(data.name)
        details.find(".top-info-text h2").text((data.bytes / 1000).toFixed(1) + " KB")
            var sharedPeople = details.find(".shared-people")
        //For hver delt person, tilføj følgende html element
        for (var i = 0; i < data.shares.length; i++) {
            var share = data.shares[i]
            console.log(share)

            var text = `<div class="owner"><div class="initials"><h1>${share.username[0].toUpperCase()}</h1><p>${share.username}</p></div><svg onclick="delShare(${share.id}, this)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></div>`
            sharedPeople.append(text)
        }
        details.find(".main-details").show();
        details.find(".details-loader").hide()
    })
}

//Denne funktion tilføjer en ny deling til billede
//Tager brugerid og billedeid som argument
//Den minder rigtig meget om ovenstående funktion og søg bruger funktion
function AddShare(imgId, userId) {
    // /AddShare
    fetch("/Home/AddShare", {   
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                imgId: imgId,
                userId: userId,

            })
      })
    .then(async function (response) {
        if (!response.ok) {
            var text = await response.json()
            throw Error(text);
        }
        return response
    })
     
    .then(response => response.json())
    //Tilføj personen til delte personer, fordi serveren retunerede ok
    .then(data => {
        var text = `<div class="owner"><div class="initials"><h1>${data.username[0].toUpperCase()}</h1><p>${data.username}</p></div><svg onclick="delShare(${data.id}, this)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></div>`
        $(".image-details .shared-people").append(text)
    })
        .catch(errors => {
            error("Error occured", errors)
    })
}

//Denne funktion fjerner en deling
//Tager delingsid og elementet der repræsentere delingen
//som argumenter. Minder om de andre funktioner
function delShare(id, element) {
    fetch("/Home/DelShare", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                id: id,
            })
    })
        .then(async function (response) {
            if (!response.ok) {
                var text = await response.text()
                throw Error(text);
            }
            return response
        })
        .then(response => response.json())
        .then(data => {
            //Fjern elementet fra siden
            $(element).closest(".owner").remove();
        })
        .catch(errors => {
            error("Error occured", errors)
        })
}

//Lukker image details draweren
function imageDetailsClose() {
    var details = $(".image-details")
    details.css("transform", "translateX(100%)")
    setTimeout(function () 
        {
         details.hide();
        }, 200)
}

/* Login funktionen, køres når en person har indtastet
brugernavn og kode og klikker login */
function signIn() {
    $(".signinmodal .loader").show(); //Vis loader
    $(".signinmodal .authentication-modal-text").hide();
    //Find værdier fra email og password input
    var email = $(".signinmodal input[name=username]").val()
    var password = $(".signinmodal input[name=password]").val()
    /*Denne Ajax request sender email og password til serveren,
     som logger os ind hvis de er rigtige*/
    $.ajax({
        url: '/Home/LogIn',
        //Lav email og password om til json
        data: JSON.stringify({
            Email: email,
            Password: password,
        }),
        type: 'POST', //Det er en post request
        /* Hvis success genindlæser vi siden
        så brugeren kan se at vedkommende er logget ind */
        success: function (data) {
            location.reload();
        },
        /*Hvis fejl viser vi en fejlbesked*/
        error: function (data) {
            $(".signinmodal .error-text").text(data.responseJSON).show(); //Hvis fejlen i loginmodal
            $(".signinmodal .loader").hide();
            $(".signinmodal .authentication-modal-text").show();
            return;
        },
        timeout: 10000,
        contentType: 'application/json; charset=utf-8'
    });
}

/*Signup funktionen fungere overordnet set
på samme måde som login funktionen, ud over 
at den også validere input. Dvs. at email skal
være en email, og password og confirm password
skal matche*/
function signUp() {
    $(".signupmodal .loader").show(); //Hvis loader
    $(".signupmodal .authentication-modal-text").hide();
    //Tjek om alle felter er udfyldt
    if (!($(".signupmodal input[name=username]").val() != "" && $(".signupmodal input[name=password]").val() != "" && $(".signupmodal input[name=confirmpassword]").val() != "")) {
        $(".signupmodal .error-text").text("Please fill in all fields").show(); //Her viser vi en fejlmeddelse
        return;
    }
    var email = $(".signupmodal input[name=username]").val()
    var password = $(".signupmodal input[name=password]").val()
    var confirmpassword = $(".signupmodal input[name=confirmpassword]").val()
    //Tjek om password og confirm password er ens
    if (password != confirmpassword) {
        $(".signupmodal .error-text").text("Passwords do not match").show();
        return;
    }
    //Tjekke om emailen er gyldig
    if (!validateEmail(email)) {
        $(".signupmodal .error-text").text("Invalid email").show();
        return;
    }
    //Fungere præcis på samme måde som for login
    $.ajax({
        url: '/Home/Register',
        data: JSON.stringify({
            Email: email,
            Password: password,
        }),
        type: 'POST',
        success: function(data) {
            location.reload();
        },
        error: function (data) {
            $(".signupmodal .error-text").text(data.responseJSON).show();
            $(".signupmodal .loader").hide();
            $(".signupmodal .authentication-modal-text").show();
            return;
        },
        timeout: 10000,
        contentType: 'application/json; charset=utf-8'
    });
}

//Denne funktion validere en email med Regex
const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/*Det er denne funktion, som sender 
et billede til databasen. Den tager to argumenter,
billedet og OCR typen. Funktionen bliver kaldt
fra et af to input felter, når de ændre sig (onchange)*/
async function sendImage(image, type) {
    //Vis status i bunden af siden
    $(".status p").text("Uploading image 0%")
    $(".status").css('opacity', 1);

    //Omdan filen til base64 (asynkront)
    var base64 = await getBase64(image[0])

    //Opret en ny formdata (simulere en reel HTML form)
    var formdata = new FormData();

    //Tilføj de tre argumenter som /UploadImage tager til formdata
    //filnavnet, filen som base64 og OCR typen.
    formdata.append('name', image[0].name);
    formdata.append('file', base64);
    formdata.append('type', type);

    /*Opret en ny Ajax request, grunden til at vi 
    ikke bruger fetch er at XMLHttpRequest gør det 
    muligt at føle med i upload og download progress*/
    var request = new XMLHttpRequest();

    //Tilføj eventlistener når et stykke data uploades
    request.upload.addEventListener('progress', function (e) {
        $(".status .statusbar").css('width', ((e.loaded / e.total * 100) * 0.75) + "%")
        $(".status p").text("Uploading image " + ((e.loaded / e.total * 100) * 0.75 ) + "%")
    });
    //På samme måde for download
    request.addEventListener('progress', function (e) {
        $(".status .statusbar").css('width', ((e.loaded / e.total * 100) * 0.25 + 75) + "%")
        $(".status p").text("Uploading image " + ((e.loaded / e.total * 100) * 0.25 + 75 ) + "%")
    })

    //Når requesten slutter eventlistener
    request.onload = function (e) {
        $(".status").css('opacity', 0); //Vis ikke statusbaren mere
        $(".status .statusbar").width(0);
        //Hvis statuskode 200 (success)
        if (request.status == 200) {
            //Send brugeren til det nyuploadede billede
            window.location = "/Home/Image/" + request.responseText
        } else {
            //Hvis fejl, hvis fejlen.
            error("Error", request.responseText)
        }
    }

    //Sæt response type som tekst
    request.responseType = "text";
    //Sæt requesten til POST til /Home/UploadImage
    request.open('post', '/Home/UploadImage');
    //Sæt timeout itl 45000
    request.timeout = 45000;
    //Start requesten med vores formdata
    request.send(formdata);
}

//Konvertere en fil til base64
async function getBase64(file) {
    //Nyt objekt af klassen FileReader
    const reader = new FileReader()
    //Retunere et nyt promise
    return new Promise(resolve => {
        //Når læseren har læst filen til ende
        reader.onload = ev => {
            //Retunere base64
            resolve(ev.target.result)
        }
        //Læs filen som data url (base64lo)
        reader.readAsDataURL(file)
    })
}