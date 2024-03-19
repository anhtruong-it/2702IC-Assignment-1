// initial flickr information
const apiKey = "api_key=84bcbeb63edc1c2b591367fcc07c81c1";
const albumId = "photoset_id=72177720315529360";
const requestAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&format=json&nojsoncallback=1" + "&" + apiKey + "&" + albumId;

$(document).ready(function () {
    getHomePageAlbum();
});

// fetch and display homepage photos
async function getHomePageAlbum() {
    const linkList = $("#container");
    linkList.empty();

    try {
        const response = await fetch(requestAlbumUrl);
        const data = await response.json();
        const album = data.photoset.photo;

        $.get("data/homepagephotos.json", function (data) {
            for (let i = 0; i < album.length; i++) {
                const photoUrl = `https://farm${album[i].farm}.staticflickr.com/${album[i].server}/${album[i].id}_${album[i].secret}.jpg`;

                let photoBox = $("<div>").addClass("photo-box");

                let subLink = $("<a class='link-destination'>").attr("href", "pages/destinations.html");
                subLink.click(function (event) {
                    event.preventDefault();
                    $.cookie("title", encodeURIComponent(album[i].title));
                    $(location).attr("href", "pages/destinations.html");
                });

                let image = $("<img>").attr("src", photoUrl).attr("width", 400).attr("height", 200);
                let description = $("<div class='content'>");
                let title = $("<h1>").text(album[i].title);
                let caption = $("<h3>").text(data[i].caption);

                description.append(title);
                description.append(caption);
                subLink.append(image);
                subLink.append(description);
                photoBox.append(subLink);
                linkList.append(photoBox);
            }
        });
    } catch (error) {
        console.error("error fetching album: ", error);
    }
}
