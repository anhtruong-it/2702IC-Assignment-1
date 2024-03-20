// initial flickr information
const apiKey = "api_key=84bcbeb63edc1c2b591367fcc07c81c1";

$(document).ready(function () {
    getAlbumId()
        .then(function (id) {
            displayThumbnails(id);
        })
        .catch(function (error) {
            console.error("error: ", error);
        })

});

// get a destination album
async function getAlbumId() {
    return new Promise((resolve, reject) => {
        var title = decodeURIComponent($.cookie("title"));

        $.get("../data/destination.json", function (data) {
            console.log("data", data);
            let matchDestination = data.find(function (item) {
                return item.destination === title;
            });

            if (matchDestination) {
                $("#title").html(title);
                resolve(`photoset_id=${matchDestination.albumId}`);
            } else {
                reject("not found");
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            reject(errorThrown);
        })
    });
}


// display 5 thumbnails of each destination
async function displayThumbnails(albumId) {
    console.log("id", albumId);
    const requestAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&format=json&nojsoncallback=1" + "&" + apiKey+ "&" + albumId;
    console.log("url: ", requestAlbumUrl);

    const linkList = $("#container");
    linkList.empty();

    try {
        const response = await fetch(requestAlbumUrl);
        const data = await response.json();
        const album = data.photoset.photo;
        console.log("photo: ", album);

        for (let i = 0; i < album.length; i++) {
            const photoUrl =  `https://farm${album[i].farm}.staticflickr.com/${album[i].server}/${album[i].id}_${album[i].secret}.jpg`;
            console.log("photo url: ", photoUrl);
            let photoBox = $("<div>").addClass("photo-box");

            let subLink = $("<a>").attr("href", photoUrl).addClass("link-destination");

            let image = $("<img>").attr("src", photoUrl).attr("width", 400).attr("height", 200);

            subLink.append(image);
            photoBox.append(subLink);
            linkList.append(photoBox);
        }

    } catch (error) {
        console.error("error thumbnails: ", error);
    }
}

