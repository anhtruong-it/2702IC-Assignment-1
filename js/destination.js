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
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            })

        // close button of modal
        $("#modal-close").click(function () {
            $("#modal-container").css("display", "none");
            $("#modal-content").attr("src", "");
        });
    });
}

// display 5 thumbnails of each destination
async function displayThumbnails(albumId) {
    const requestAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&format=json&nojsoncallback=1" + "&" + apiKey + "&" + albumId;
    const linkList = $("#container");
    linkList.empty();

    try {
        const response = await fetch(requestAlbumUrl);
        const data = await response.json();
        const album = data.photoset.photo;
        fetchPhoto(album, album.length);

    } catch (error) {
        console.error("error thumbnails: ", error);
    }
}

// fetch a photo
function fetchPhoto(data, number) {
    let photoData = data.map(photo => ({ id: photo.id, title: photo.title, })).slice(0, number);
    photoData.forEach(photo => {
        getSize(photo);
    })
}

// get a size for a photo
function getSize(photo) {
    let getPhotoStr = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&nojsoncallback=1" + "&" + apiKey + "&photo_id=" + photo.id;
    let getSizeStr = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1" + "&" + apiKey + "&photo_id=" + photo.id;

    $.when(
        $.get(getPhotoStr),
        $.get(getSizeStr)
    ).done(function(photoData, sizeData) {
        let thumb = sizeData[0].sizes.size[3].source;
        let fullSize = sizeData[0].sizes.size[sizeData[0].sizes.size.length-1].source;
        let dateString = photoData[0].photo.dates.taken;
        let date = new Date(dateString);
        let setDate = { year: "numeric", month: "short", day: "numeric" };
        let formattedDate = date.toLocaleDateString("en-GB", setDate);
        let photos = [{ file: thumb, full: fullSize, title: photo.title, id: photo.id , date: formattedDate}];
        displayFullSize(photos)
    });
}

// display all photos of a destination
function displayFullSize(photos) {
    let photoBox = $("<div>").addClass("photo-box");

    let htmlStr = `<figure data-full="${photos[0].full}">
    <img src="${photos[0].file}" alt="${photos[0].title}">
    <figcaption>${photos[0].title} - ${photos[0].date}</figcaption>
</figure><br>`;

    photoBox.append(htmlStr);
    $("#container").append(photoBox);

    // display a photo modal
    $("figure").last().click(function () {
        $("#modal-container").css("display", "block");
        $("#modal-content").attr("src", $(this).attr("data-full"));
        $("#modal-caption").text(photos[0].title);
        recentViewedPhoto(photos[0].id);
    });
}

// store recent viewed photo
function recentViewedPhoto(id) {
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