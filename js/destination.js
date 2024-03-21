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
        fetchPhoto(album, 5);

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
    let getSizeStr = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1" + "&" + apiKey + "&photo_id=" + photo.id;

    $.get(getSizeStr, function (data) {
        let thumb = data.sizes.size[5].source;
        let photos = [{ file: thumb, title: photo.title, id: photo.id }];
        displayFullSize(photos)
    });
}

// display all photos of a destinaton
function displayFullSize(photos) {
    let htmlStr = `<figure data-full="${photos[0].file}">
    <img src="${photos[0].file}" alt="${photos[0].title}">
    <figcaption>${photos[0].title}</figcaption>
</figure><br>`;
    $("#container").append(htmlStr);

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
    //localStorage.removeItem("recentView");
    let jsonData = JSON.parse(localStorage.getItem("recentView")) || [];
    console.log("f",jsonData);

    // jsonData = jsonData.filter(item => item.id !== id);

    // jsonData.push({ "id": `${id}`});

    // localStorage.setItem("recentView", JSON.stringify(jsonData));

    // console.log("json file has been updated");

    /* $.get("../data/recentView.json", function(data) {
        console.log("data: ", data);
    }) */
}