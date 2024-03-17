$(document).ready(function () {
    homePage();
});

function homePage() {
    $.get("data/homepagephotos.json", function (data) {
        var linkList = $("#container");
        linkList.innerHTML = ""

        for (let i = 0; i < data.length; i++) {
            var photoBox = $("<div>").addClass("photo-box");

            var subLink = $("<a class='link-destination'>").attr("href", "pages/destinations.html");

            subLink.click(function(event) {
                event.preventDefault();
                $.cookie("title", encodeURIComponent(data[i].title));
                $(location).attr("href", "pages/destinations.html");
            });

            var image = $("<img>").attr("src", "photos/" + data[i].name)
                .attr("width", 400)
                .attr("height", 200);

            var description = $("<div class='content'>");

            var title = $("<h1>").text(data[i].title);
            var caption = $("<h3>").text(data[i].caption);

            description.append(title);
            description.append(caption);
            subLink.append(image);
            subLink.append(description);
            photoBox.append(subLink);
            linkList.append(photoBox);
        }
    });
}
