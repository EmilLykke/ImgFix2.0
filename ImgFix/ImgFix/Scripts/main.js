$(document).ready(function () {
    $("#uploadButton1").click(function () {
        $("#imagePicker1").click();
    })
});

$(document).ready(function () {
    $("#uploadButton2").click(function () {
        $("#imagePicker2").click();
    })
});

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
            console.log(data);
        },
        error: function (data) {
            $(".signinmodal .error-text").text(data.responseJSON).show();
            return;
        },
        timeout: 10000,
        contentType: 'application/json; charset=utf-8'
    });
    $(".signinmodal .loader").hide();
    $(".signinmodal .authentication-modal-text").show();
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
            return;
        },
        timeout: 10000,
        contentType: 'application/json; charset=utf-8'
    });
    $(".signupmodal .loader").hide();
    $(".signupmodal .authentication-modal-text").show();
}

const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

async function sendImage(image, type) {
    //console.log(image[0].name);
    var base64 = await getBase64(image[0])
    //console.log(base64);
    
    var base64arr = base64.split(",");
    //console.log(base64arr[1]);
    $.post(
        "Home/UploadImage", { name: image[0].name, file: base64arr[1], type: type }, function (msg) {
            console.log(msg);
        }
    );
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