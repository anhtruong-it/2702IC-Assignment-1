$(document).ready(function () {
    homePage();
});

function homePage() {
    $.get("data/homepagephotos.json", function (data) {
        var linkList = $("#container");
        linkList.empty();

        for (let i = 0; i < data.length; i++) {
            var photoBox = $("<div>").addClass("photo-box");

            var subLink = $("<a class='link-destination'>").attr("href", "#");

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

{/* <div class="photo-box" id="photo-box">
<a class="link-destination" href="#">
<img src="photos/cairn.jpg" alt="cairn" height="200" width="400" />
<div class="content">
 <h1>Cairn</h1>
 <h3>
   It is a nice place.
</div>
</a>  
   </div> */}