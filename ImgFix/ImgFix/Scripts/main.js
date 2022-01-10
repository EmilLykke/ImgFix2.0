$(document).ready(function () {
    $("#uploadButton").click(function () {
        $("#imagePicker").click()
    })
});

async function sendImage(image) {
    var base64 = await getBase64(image[0])
    console.log(base64)
    $.post(
        "Home/UploadImage", { file: base64 }, function (msg) {
            console.log(msg)
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