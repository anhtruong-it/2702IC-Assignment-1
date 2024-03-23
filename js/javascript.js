// initial flickr information
const apiKey = "api_key=84bcbeb63edc1c2b591367fcc07c81c1";
const albumId = "photoset_id=72177720315529360";
const requestAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&format=json&nojsoncallback=1" + "&" + apiKey + "&" + albumId;

$(document).ready(function () {
    getHomePageAlbum();
    displayRecentViewed();

    $("#modal-close").click(function () {
        $("#modal-container").css("display", "none");
        $("#modal-content").attr("src", "");

        const recent = $("#recent");
        recent.empty();

        displayRecentViewed();
    });
});

async function displayRecentViewed() {
    let viewedPhotosString = localStorage.getItem("recentViewedPhotos");
    if (viewedPhotosString != null) {
        await RecentViewed(viewedPhotosString);
    }
}

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

                let image = $("<img>").attr("src", photoUrl);
                let description = $("<div class='content'>");
                let title = $("<h2>").text(album[i].title);
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

async function RecentViewed(viewedPhotosString) {
    let viewedPhotos = viewedPhotosString ? JSON.parse(viewedPhotosString) : [];
    await fetchPhoto(viewedPhotos, viewedPhotos.length);
}

async function fetchPhoto(data, number) {
    let photoData = data.map(photo => ({
        id: photo
    })).slice(0, number);
    try {
        const photos = await Promise.all(photoData.map(photo => getSize(photo)));
        await displayFullSize(photos);
    } catch (error) {
        console.log("Error fetching photos: ", error);
    }
}

function getSize(photo) {
    return new Promise((resolve, reject) => {
        let getSizeStr = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1" + "&" + apiKey + "&photo_id=" + photo.id;
        $.get(getSizeStr, function (data) {
            let thumb = data.sizes.size[2].source;
            let photos = [{ file: thumb, id: photo.id }];
            resolve(photos);
        }).fail(function () {
            reject(new Error("Failed to fetch photos: " + photo.id));
        });
    });
}

async function displayFullSize(photos) {
    photos.sort((a, b) => a.id - b.id);
    photos.reverse();

    photos.forEach(photo => {
        let htmlStr = `<figure data-full="${photo[0].file}">
                        <img src="${photo[0].file}">
                        </figure><br>`;

        $("#recent").append(htmlStr);

        $("figure").last().click(function () {
            $("#modal-container").css("display", "block");
            $("#modal-content").attr("src", $(this).attr("data-full"));
            $("#modal-caption").text(photo[0].title);

            recentViewedPhotos(photo[0].id);
        });
    });
}

// store recent viewed photo
function recentViewedPhotos(id) {
    let recentViewedList = localStorage.getItem("recentViewedPhotos");
    console.log("recent viewed 1: ", recentViewedList);

    let existingRecentViewedList = recentViewedList ? JSON.parse(recentViewedList) : [];
    console.log("recent viewed: ", existingRecentViewedList);

    if (existingRecentViewedList.includes(id)) {
        let newRecentViewedList = existingRecentViewedList.filter(function (item) {
            return item !== id;
        });

        newRecentViewedList.push(id);
        existingRecentViewedList = newRecentViewedList;
        console.log("second recent viewed:, ", existingRecentViewedList);
    } else {
        existingRecentViewedList.push(id);
    }

    if (existingRecentViewedList.length > 5) {
        existingRecentViewedList = existingRecentViewedList.slice(-5);
    }

    localStorage.setItem("recentViewedPhotos", JSON.stringify(existingRecentViewedList));
}