$(document).ready(function () {
    $("#uploadButton").click(function () {
        $("#imagePicker").click()
    })
});

async function sendImage(image) {
    var base64 = await getBase64(image[0])
    var base64arr = base64.split(",");
    console.log(base64arr[1])
    var formdata = new FormData();
    formdata.append('file', base64arr[1]);
    var request = new XMLHttpRequest();
    request.upload.addEventListener('progress', function (e) {
        console.log(e)
    });
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            console.log(request.response)
        }
    }
    request.open('post', 'Home/UploadImage');
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