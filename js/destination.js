const apiKey = "84bcbeb63edc1c2b591367fcc07c81c1";
$(document).ready(function () {

    displayThumbnails();

    displayRecentViewed();

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
    //const requestAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&format=json&nojsoncallback=1" + "&" + apiKey + "&" + albumId;
    const destination = $.cookie("destination");
    const title = decodeURIComponent($.cookie("title"));
    $("#title").html(title);

    const requestPhotos = `https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page=5&text=${destination}&format=json&nojsoncallback=1&api_key=${apiKey}&sort=relevance`;

    const linkList = $("#container");
    linkList.empty();

    try {
        const response = await fetch(requestPhotos);
        const data = await response.json();
        console.log("destination: ", data);
        fetchPhoto(data.photos.photo, data.photos.photo.length, "thumbnails");

    } catch (error) {
        console.error("error thumbnails: ", error);
    }
}

// fetch a photo
async function fetchPhoto(data, number, state) {

    let photoData;
    if (state === "thumbnails") {
        console.log("fetch thumbnails:", data);
        photoData = data.map(photo => ({
            id: photo.id,
            title: photo.title,
            farm: photo.farm,
            secret: photo.secret,
            server: photo.server
        })).slice(0, number);
        const photos = await Promise.all(photoData.map(photo => getSize(photo, state)));
        console.log("fetch thumbs:", photos);
        await displayFullSize(photos, state);

    } else {
        console.log("fetch recent:", data);
        photoData = data.map(photo => ({
            id: photo
        })).slice(0, number);
        try {
            const photos = await Promise.all(photoData.map(photo => getSize(photo, state)));
            console.log("fetch recent:", photos);
            await displayFullSize(photos, state);
        } catch (error) {
            console.log("Error fetching photos", error);
        }
    }


}

// get a size for a photo
function getSize(photo, state) {
    return new Promise((resolve, reject) => {
        let getPhotoStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;
        let getSizeStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;

        $.when(
            $.get(getPhotoStr),
            $.get(getSizeStr)
        ).done(function (photoData, sizeData) {
            let thumb = sizeData[0].sizes.size[3].source;
            let recentSize = sizeData[0].sizes.size[1].source;
            let fullSize = sizeData[0].sizes.size[sizeData[0].sizes.size.length - 1].source;

            let dateString = photoData[0].photo.dates.taken;
            let date = new Date(dateString);
            let setDate = { year: "numeric", month: "short", day: "numeric" };
            let formattedDate = date.toLocaleDateString("en-GB", setDate);
            let photos = [{ file: thumb, full: fullSize, recentSize: recentSize, title: photo.title, id: photo.id, date: formattedDate }];
            resolve(photos);
        });
    });
}

// display all photos of a destination
function displayFullSize(photos, state) {
    console.log("sate display: ", state);
    if (state === "thumbnails") {
        console.log("display thumbnails");
        console.log("photos ", photos[0]);
        photos.forEach(photo => {
            let photoBox = $("<div>").addClass("photo-box");

            let htmlStr = `<figure data-full="${photo[0].full}">
            <img src="${photo[0].file}" alt="${photo[0].title}">
            <figcaption>${photo[0].title} - ${photo[0].date}</figcaption>
        </figure><br>`;

            photoBox.append(htmlStr);
            $("#container").append(photoBox);

            // display a photo modal
            $("#container").on("click", "figure", function () {
                $("#modal-container").css("display", "block");
                $("#modal-content").attr("src", $(this).attr("data-full"));
                $("#modal-caption").text(photo[0].title);
                console.log("photos: ", photo);
                recentViewedPhoto(photo[0].id);
            });
        })

    } else {
        console.log("display recent");
        photos.sort((a, b) => a.id - b.id);
        photos.reverse();
        console.log("recent size: ", photos)
        photos.forEach(photo => {
            let htmlStr = `<figure data-full="${photo[0].full}">
                        <img src="${photo[0].recentSize}" width="100px" height="100px" style="border-radius: 50px;">
                        </figure><br>`;

            $("#recent").append(htmlStr);

            $("#recent").on("click", "figure", function () {
                $("#recent-container").css("display", "block");
                $("#recent-content").attr("src", $(this).attr("data-full"));
                $("#recent-caption").text(photo[0].title);

                recentViewedPhoto(photo[0].id);
            });
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
    console.log("Recent viewed photos: ", existingRecentViewedList);

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
    console.log("recent: ", viewedPhotosString);
    if (viewedPhotosString != null) {
        await RecentViewed(viewedPhotosString);
    }
}

async function RecentViewed(viewedPhotosString) {
    let viewedPhotos = viewedPhotosString ? JSON.parse(viewedPhotosString) : [];
    await fetchPhoto(viewedPhotos, viewedPhotos.length, "recent");
}