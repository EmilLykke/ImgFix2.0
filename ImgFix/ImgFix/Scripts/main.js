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