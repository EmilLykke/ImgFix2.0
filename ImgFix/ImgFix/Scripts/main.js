$(document).ready(function () {
    $("#uploadButton1").click(function () {
        if (isRequestAuthenticated) {
            $("#imagePicker1").click();
        } else {
            error("Please login", "Please login to upload an image.")
        }
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
        }, 8000)
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