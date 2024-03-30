const apiKey = "84bcbeb63edc1c2b591367fcc07c81c1";
$(document).ready(async function () {

    await displayThumbnails();

    await displayRecentViewed();

    // close button of modal
    $("#modal-close").click(function () {
        $("#modal-container").css("display", "none");
        $("#modal-content").attr("src", "");

        const recent = $("#recent");
        recent.empty();

        displayRecentViewed();
    });

    // close button of recent modal
    $("#recent-close").click(function () {
        $("#recent-container").css("display", "none");
        $("#recent-content").attr("src", "");

        const recent = $("#recent");
        recent.empty();

        displayRecentViewed();
    });


});

// display 5 thumbnails of each destination
async function displayThumbnails() {
    const destination = $.cookie("destination");
    const title = decodeURIComponent($.cookie("title"));
    $("#title").html(title);

    const requestPhotos = `https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page=5&text=${destination}&format=json&nojsoncallback=1&api_key=${apiKey}&sort=relevance`;

    const linkList = $("#container");
    linkList.empty();

    try {
        const response = await fetch(requestPhotos);
        const data = await response.json();
        fetchPhoto(data.photos.photo, data.photos.photo.length, "thumbnails");

    } catch (error) {
        console.error("error thumbnails: ", error);
    }
}

// fetch a photo
async function fetchPhoto(data, number, state) {

    let photoData;
    if (state === "thumbnails") {
        photoData = data.map(photo => ({
            id: photo.id,
            title: photo.title,
            farm: photo.farm,
            secret: photo.secret,
            server: photo.server
        })).slice(0, number);
        photoData.forEach(photo => {
            getSize(photo, state);
        });
    } else if (state === "recent") {
        photoData = data.map(photo => ({
            id: photo
        })).slice(0, number);
        try {
            const photos = await Promise.all(photoData.map(photo => getSize(photo, state)));
            displayFullSize(photos, state);
        } catch (error) {
            console.log("Error fetching photos", error);
        }
    }
}

// get a size for a photo
function getSize(photo, state) {

    if (state === "thumbnails") {
        const getPhotoStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;
        const getSizeStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;

        $.when(
            $.get(getPhotoStr),
            $.get(getSizeStr)
        ).done(function (photoData, sizeData) {
            const thumb = sizeData[0].sizes.size[3].source;
            const fullSize = sizeData[0].sizes.size[sizeData[0].sizes.size.length - 1].source;
            const dateString = photoData[0].photo.dates.taken;
            const date = new Date(dateString);
            const setDate = { year: "numeric", month: "short", day: "numeric" };
            const formattedDate = date.toLocaleDateString("en-GB", setDate);
            const photos = [{ file: thumb, full: fullSize, title: photo.title, id: photo.id, date: formattedDate }];
            displayFullSize(photos, state);
        });
    } else if (state === "recent") {
        return new Promise((resolve, reject) => {
            const getPhotoStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;
            const getSizeStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;

            $.when(
                $.get(getPhotoStr),
                $.get(getSizeStr)
            ).done(function (photoData, sizeData) {
                const thumb = sizeData[0].sizes.size[1].source;
                const fullSize = sizeData[0].sizes.size[sizeData[0].sizes.size.length - 1].source;
                const photos = [{ recentSize: thumb, full: fullSize, id: photo.id, title: photoData[0].photo.title._content }];
                resolve(photos);
            });
        });
    }

}

// display all photos of a destination
function displayFullSize(photo, state) {
    if (state === "thumbnails") {
        const photoBox = $("<div>").addClass("photo-box");

        const htmlStr = `<figure data-full="${photo[0].full}">
            <img src="${photo[0].file}" alt="${photo[0].title}">
            <figcaption>${photo[0].title} - ${photo[0].date}</figcaption>
        </figure><br>`;

        photoBox.append(htmlStr);
        $("#container").append(photoBox);

        // display a photo modal
        $("figure", photoBox).click(function () {
            $("#modal-container").css("display", "block");
            $("#modal-content").attr("src", $(this).attr("data-full"));
            $("#modal-caption").text(photo[0].title);
            recentViewedPhoto(photo[0].id);
        });
    } else if (state === "recent") {
        photo.sort((a, b) => a.id - b.id);
        photo.reverse();
        photo.forEach((photos, index) => {
            let htmlStr = `<div class="recent-photos" data-full="${photos[0].full}" data-index="${index}">
                        <img src="${photos[0].recentSize}" width="100px" height="100px" style="border-radius: 50px;">
                        </div><br>`;

            $("#recent").append(htmlStr);
        });
        $(".recent-photos").click(function () {
            const photosIndex = $(this).attr("data-index");
            const clickedPhoto = photo[photosIndex];
            $("#recent-container").css("display", "block");
            $("#recent-content").attr("src", $(this).attr("data-full"));
            $("#recent-caption").text(clickedPhoto[0].title);
            recentViewedPhoto(clickedPhoto[0].id);
        });
    }

}

// store recent viewed photo
function recentViewedPhoto(id) {

    let recentViewedList = localStorage.getItem("recentViewedPhotos");
    let existingRecentViewedList = recentViewedList ? JSON.parse(recentViewedList) : [];

    if (existingRecentViewedList.includes(id)) {
        let newRecentViewedList = existingRecentViewedList.filter(function (item) {
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
}

function photoPreview() {
    $("#photoInputs").on("change", function (event) {
        let files = event.target.files;
        let preview = $("#photosPreview");
        preview.empty();

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let reader = new FileReader();

            reader.onload = function (e) {
                let photo = $("<img>");
                photo.attr("src", e.target.result);
                photo.css({ width: "100px", height: "100px" });
                preview.append(photo);
                console.log("photo: ", photo);
            }


            reader.readAsDataURL(file);
        }
    });
}

async function displayRecentViewed() {
    let viewedPhotosString = localStorage.getItem("recentViewedPhotos");
    if (viewedPhotosString != null) {
        await RecentViewed(viewedPhotosString);
    }
}

async function RecentViewed(viewedPhotosString) {
    let viewedPhotos = viewedPhotosString ? JSON.parse(viewedPhotosString) : [];
    await fetchPhoto(viewedPhotos, viewedPhotos.length, "recent");
}