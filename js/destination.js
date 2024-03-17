$(document).ready(function () {
    destinationPage();
});

function destinationPage() {
    var title = decodeURIComponent($.cookie("title"));
    console.log("destination: ", title);
}

