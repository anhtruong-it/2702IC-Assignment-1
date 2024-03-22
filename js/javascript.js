// initial flickr information
const apiKey = "api_key=84bcbeb63edc1c2b591367fcc07c81c1";
const albumId = "photoset_id=72177720315529360";
const requestAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&format=json&nojsoncallback=1" + "&" + apiKey + "&" + albumId;

$(document).ready(function () {
    getHomePageAlbum();
    //let recentViewed = localStorage.getItem("recentViewedPhotos");
    //console.log("list: ", recentViewed);
    let viewedPhotosString = localStorage.getItem("recentViewedPhotos");
    console.log("list: ", viewedPhotosString);
    //localStorage.removeItem("recentViewedPhotos");
    if (viewedPhotosString != null) {
        displayRecentViewed(viewedPhotosString);
    }

    $("#modal-close").click(function () {
        $("#modal-container").css("display", "none");
        $("#modal-content").attr("src", "");
    });
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

function displayRecentViewed(viewedPhotosString) {
    let viewedPhotos = viewedPhotosString ? JSON.parse(viewedPhotosString) : [];
    //viewedPhotos.reverse();
    fetchPhoto(viewedPhotos, viewedPhotos.length);
}

function fetchPhoto(data, number) {
    let photoData = data.map(photo => ({
        id: photo
    })).slice(0, number);
    photoData.forEach(photo => {
        getSize(photo);
    });
}

function getSize(photo) {
    let getSizeStr = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1" + "&" + apiKey + "&photo_id=" + photo.id;

    $.get(getSizeStr, function (data) {
        let thumb = data.sizes.size[2].source;
        console.log("size: ", thumb);
        let photos = [{ file: thumb, id: photo.id }];
        displayFullSize(photos);
    });
}

function displayFullSize(photos) {
    let htmlStr = `<figure data-full="${photos[0].file}">
    <img src="${photos[0].file}">
</figure><br>`;
    $("#recent").append(htmlStr);

    $("figure").last().click(function () {
        $("#modal-container").css("display", "block");
        $("#modal-content").attr("src", $(this).attr("data-full"));
        $("#modal-caption").text(photos[0].title);
        recentViewedPhotos(photos[0].id);
    });
}

// store recent viewed photo
function recentViewedPhotos(id) {
    let recentViewedList = localStorage.getItem("recentViewedPhotos");
    let existingRecentViewedList = recentViewedList ? JSON.parse(recentViewedList) : [];

    if (existingRecentViewedList.includes(id)) {
        let newRecentViewedList = existingRecentViewedList.filter(function(item) {
            return item !== id;
        });
        newRecentViewedList.push(id);
        existingRecentViewedList = newRecentViewedList;
    } else {
        existingRecentViewedList.push(id);
    }

    if (existingRecentViewedList.length > 5) {
        existingRecentViewedList = existingRecentViewedList.slice(-5);
    }

    localStorage.setItem("recentViewedPhotos", JSON.stringify(existingRecentViewedList));
    console.log("Recent viewed photos: ", existingRecentViewedList);

}