$(document).ready(function () {
    $("#uploadButton1").click(function () {
        if (isRequestAuthenticated) {
            $("#imagePicker1").click();
        } else {
            error("Please login", "Please login to upload an image.")
        }
    })
    $(".image-details .sharing .search input").focus(function () {
        var result = $(".image-details .sharing .search .search-result")
        result.find(".person").remove()
        result.find(".loader-wrapper").hide()
        result.find(".no-results").show()
    })
    $(".image-details .sharing .search input").keyup(async function () {
        var val = $(".image-details .sharing .search input").val()
        var result = $(".image-details .sharing .search .search-result")
        result.find(".loader-wrapper").show()
        result.find(".no-results").hide()
        fetch("/Home/SearchPeople", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: val })
        })
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response
        })
        .then(response => response.json())
        .then(data => {
            result.find(".loader-wrapper").hide()
            result.find(".person").remove()
            result.find(".no-results").hide()
            for (var i = 0; i < data.Users.length; i++) {
                user = data.Users[i]
                var text = `<div class="person" onmousedown="AddShare(${$(".image-details").data("id")}, '${user.id}')"><div class="initials"><h1>${user.email[0].toUpperCase()}</h1><p>${user.email}</p></div></div>`
                result.append(text)
            }
        })
            .catch((error) => {
            console.log(error)
            result.find(".person").remove()
            result.find(".loader-wrapper").hide()
            result.find(".no-results").show()
        })
    })
    $(".image-details .sharing .search .person").mousedown(function (e) {
        e.stopImmediatePropagations
        e.preventDefault();

        console.log(e)
    })
});

$(document).ready(function () {
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

function error(title, message) {
    var elem = $("<div class='error' style='transform: translateX(330px)'><div class='errorcontent'><p class='errortitle'>" + title + "</p><p class='errormessage'>" + message + "</p></div ><div class='errorbar'></div></div >").appendTo("#error-section")
    setTimeout(function () {
        elem.css('transform', 'translateX(0)')
        elem.find(".errorbar").css('width', '0px')
        setTimeout(function () {
            elem.css('transform', 'translateX(330px)')
            setTimeout(function () {
                elem.remove()
            }, 200)
        }, 3000)
    }, 50)
}

function downloadMyImage(element) {
    var imageData = element.closest(".image").find(".image-data")
    var a = document.createElement("a"); //Create <a>
    console.log(element.closest(".image").find(".image-data").attr("src"))
    a.href = imageData.attr("src")
    a.download = imageData.data("name")
    a.click(); //Downloaded file
}

async function imageDetails(id) {
    var details = $(".image-details")
    details.find(".main-details").hide();
    details.find(".details-loader").show()
    details.find(".owner").remove();
    details.css("transform", "translateX(100%)")
    details.show();
    $(".image-details").data("id", id   )
    details.css("transform", "")
    var ids = parseInt(id);
    console.log(ids)
    fetch("/Home/ImageDetails", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: ids})
    })
    .then(response => response.json())
    .then(data => {
        details.find(".top-info-text h1").text(data.name)
        details.find(".top-info-text h2").text((data.bytes / 1000).toFixed(1) + " KB")
        var sharedPeople = details.find(".shared-people")
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

function AddShare(imgId, userId) {
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
          .then(data => {
        console.log(data)   
        var text = `<div class="owner"><div class="initials"><h1>${data.username[0].toUpperCase()}</h1><p>${data.username}</p></div><svg onclick="delShare(${data.id}, this)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></div>`
        $(".image-details .shared-people").append(text)
    })
        .catch(errors => {
            error("Error occured", errors)
    })
}

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
            $(element).closest(".owner").remove();
        })
        .catch(errors => {
            error("Error occured", errors)
        })
}

function imageDetailsClose() {
    var details = $(".image-details")
    details.css("transform", "translateX(100%)")
    setTimeout(function () 
        {
         details.hide();
        }, 200)
}

function signIn() {
    $(".signinmodal .loader").show();
    $(".signinmodal .authentication-modal-text").hide();
    var email = $(".signinmodal input[name=username]").val()
    var password = $(".signinmodal input[name=password]").val()
    $.ajax({
        url: '/Home/LogIn',
        data: JSON.stringify({
            Email: email,
            Password: password,
        }),
        type: 'POST',
        success: function (data) {
            console.log(data)
            console.log("Shiet")
            location.reload();
        },
        error: function (data) {
            console.log(data);
            console.log("Fuck");
            $(".signinmodal .error-text").text(data.responseJSON).show();
            $(".signinmodal .loader").hide();
            $(".signinmodal .authentication-modal-text").show();
            return;
        },
        timeout: 10000,
        contentType: 'application/json; charset=utf-8'
    });
}

function signUp() {
    $(".signupmodal .loader").show();
    $(".signupmodal .authentication-modal-text").hide();
    if (!($(".signupmodal input[name=username]").val() != "" && $(".signupmodal input[name=password]").val() != "" && $(".signupmodal input[name=confirmpassword]").val() != "")) {
        $(".signupmodal .error-text").text("Please fill in all fields").show();
        return;
    }
    var email = $(".signupmodal input[name=username]").val()
    var password = $(".signupmodal input[name=password]").val()
    var confirmpassword = $(".signupmodal input[name=confirmpassword]").val()
    if (password != confirmpassword) {
        $(".signupmodal .error-text").text("Passwords do not match").show();
        return;
    }
    if (!validateEmail(email)) {
        $(".signupmodal .error-text").text("Invalid email").show();
        return;
    }

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

const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

async function sendImage(image, type) {
    $(".status p").text("Uploading image 0%")
    $(".status").css('opacity', 1);
    //console.log(image[0].name);
    var base64 = await getBase64(image[0])
    //console.log(base64);
    
    /*var base64arr = base64.split(",");*/
    //console.log(base64arr[1]);


    var formdata = new FormData();

    formdata.append('name', image[0].name);
    formdata.append('file', base64);
    formdata.append('type', type);

    var request = new XMLHttpRequest();

    request.upload.addEventListener('progress', function (e) {
        $(".status .statusbar").css('width', ((e.loaded / e.total * 100) * 0.75) + "%")
        $(".status p").text("Uploading image " + ((e.loaded / e.total * 100) * 0.75 ) + "%")
    });
    request.addEventListener('progress', function (e) {
        $(".status .statusbar").css('width', ((e.loaded / e.total * 100) * 0.25 + 75) + "%")
        $(".status p").text("Uploading image " + ((e.loaded / e.total * 100) * 0.25 + 75 ) + "%")
    })

    request.onload = function (e) {
        $(".status").css('opacity', 0);
        $(".status .statusbar").width(0);
        if (request.status == 200) {
            window.location = "/Home/Image/" + request.responseText
        } else {
            error("Error", request.responseText)
        }
    }
    request.responseType = "text";
    request.open('post', '/Home/UploadImage');
    request.timeout = 45000;
    request.send(formdata);
}

async function getBase64(file) {
    const reader = new FileReader()
    return new Promise(resolve => {
        reader.onload = ev => {
            resolve(ev.target.result)
        }
        reader.readAsDataURL(file)
    })
}