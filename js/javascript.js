// initial flickr information
const apiKey = "84bcbeb63edc1c2b591367fcc07c81c1";

// initial pexels API
const pixabayApi = "43144252-c0d9ad58dba53c4092267a584";

$(document).ready(function () {
    const currentPaths = window.location.pathname;
    if (currentPaths === "/" || currentPaths === "/index.html") {
        // Initialize the slider
        initSlider('.slider-container', 3000);
        menuDropdown();

        getHomePageAlbum();
        displayRecentViewed();

        $("#modal-close").click(function () {
            $("#modal-container").css("display", "none");
            $("#modal-content").attr("src", "");

            const recent = $("#recent");
            recent.empty();

            displayRecentViewed();
        });
    }
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
        const destinationData = await $.get("data/destination.json");
        for (let i = 0; i < destinationData.length; i++) {
            const destinationSearch = destinationData[i].destination;
            const encodedDestination = encodeURIComponent(destinationSearch);
            const response = await fetch(`https://pixabay.com/api/?key=${pixabayApi}&q=${encodedDestination}&order=popular&lang=en`);
            if (!response.ok) {
                throw new Error("Failed to fetch photos");
            }
            const data = await response.json();
            const imgUrl = data.hits[0].webformatURL;
            const photoBox = $("<div>").addClass("photo-box");

            const subLink = $("<a class='link-destination'>").attr("href", "pages/destinations.html");
            subLink.click(function (event) {
                event.preventDefault();
                $.cookie("title", encodeURIComponent(destinationData[i].destination));
                $.cookie("destination", encodedDestination);
                $(location).attr("href", "pages/destinations.html");
            });
            const image = $("<img>").attr("src", imgUrl);
            const description = $("<div class='content'>");
            const title = $("<h2>").text(destinationData[i].destination);
            const caption = $("<h3>").text(destinationData[i].caption);

            description.append(title);
            description.append(caption);
            subLink.append(image);
            subLink.append(description);
            photoBox.append(subLink);
            linkList.append(photoBox);
        }
    } catch (error) {
        console.error("error fetching album: ", error);
    }
}

async function RecentViewed(viewedPhotosString) {
    const viewedPhotos = viewedPhotosString ? JSON.parse(viewedPhotosString) : [];
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
        let getPhotoStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;
        let getSizeStr = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1&api_key=${apiKey}&photo_id=${photo.id}`;
        $.when(
            $.get(getPhotoStr),
            $.get(getSizeStr)
        ).done(function (photoData, sizeData) {
            let thumb = sizeData[0].sizes.size[1].source;
            let fullSize = sizeData[0].sizes.size[sizeData[0].sizes.size.length - 1].source;
            let photos = [{ file: thumb, full: fullSize, id: photo.id, title: photoData[0].photo.title._content }];
            resolve(photos);
        });
    });
}

async function displayFullSize(photos) {
    photos.sort((a, b) => a.id - b.id);
    photos.reverse();

    photos.forEach(photo => {
        let htmlStr = `<figure data-full="${photo[0].full}">
                        <img src="${photo[0].file}" width="100px" height="100px" style="border-radius: 50px;">
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

function openNav() {
    $("#mySidenav").css("width", "250px");
    $("#main").css("marginLeft", "250px");
}

function closeNav() {
    $("#mySidenav").css("width", "0");
    $("#main").css("marginLeft", "0");
}

function menuDropdown() {
    $(".dropdown").click(function () {
        $(this).find(".dropdown-content").toggle();
    });
}

function initSlider(containerSelector, interval) {
    let slideIndex = 0;
    const container = $(containerSelector);
    const slides = container.children('.slider').children('img');
    const dots = container.find('.dot');

    function changeBanner(index) {
        slideIndex = index;
        slides.hide();
        dots.removeClass('active');
        $(slides[slideIndex]).show();
        $(dots[slideIndex]).addClass('active');
    }

    function nextSlide() {
        slideIndex++;
        if (slideIndex >= slides.length) {
            slideIndex = 0;
        }
        changeBanner(slideIndex);
    }

    let timer = setInterval(nextSlide, interval);

    // Pause the slider on hover
    container.on('mouseenter', function () {
        clearInterval(timer);
    });

    // Resume the slider on mouseout
    container.on('mouseleave', function () {
        timer = setInterval(nextSlide, interval);
    });

    // Handle click event for dots
    container.find('.dot').on('click', function () {
        const index = $(this).index();
        changeBanner(index);
        clearInterval(timer);
    });
}


