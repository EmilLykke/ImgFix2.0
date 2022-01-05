$(document).ready(function () {
    $("#uploadButton").click(function () {
        $("#imagePicker").click()
    })
});

function sendImage(image) {
    var formData = new FormData();
    formData.append('file', image[0]);
    console.log(formData)
    $.ajax({
        url: "Home/UploadImage",
        data: formData,
        type: "POST",
        processData: false,  // tell jQuery not to process the data
        contentType: false,
        success: function (msg) {
            console.log(msg)
        }
    });
}