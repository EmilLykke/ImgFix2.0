$(document).ready(function () {
    $("#uploadButton").click(function () {
        $("#imagePicker").click()
    })
});

async function sendImage(image) {
    console.log("fis")
    var base64 = await getBase64(image[0])
    var base64arr = base64.split(",");
    console.log(base64arr[1])
    $.post(
        "Home/UploadImage", { file: base64arr[1] }, function (msg) {
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