
// initial pexels API
const pixabayApi = "43144252-c0d9ad58dba53c4092267a584";

$(document).ready(function () {

    menuDropdown();

    initSlider('.slider-container', 3000);

    getHomePageAlbum();


});

// menu section
function menuDropdown() {
    $(".dropdown").click(function () {
        $(this).find(".dropdown-content").toggle();
    });
}

// fetch and display homepage photos
async function getHomePageAlbum() {
    const linkList = $("#container");
    linkList.empty();

    try {
        const destinationData = await $.get("../data/destination.json");
        for (let i = 0; i < destinationData.length; i++) {
            const destinationSearch = destinationData[i].destination;
            const encodedDestination = encodeURIComponent(destinationSearch);

            // use Pexels API
            const response = await fetch(`https://pixabay.com/api/?key=${pixabayApi}&q=${encodedDestination}&order=popular&lang=en`);
            if (!response.ok) {
                throw new Error("Failed to fetch photos");
            }
            const data = await response.json();
            const imgUrl = data.hits[0].webformatURL;
            const photoBox = $("<div>").addClass("photo-box");

            const subLink = $("<a class='link-destination'>").attr("href", "../destinations.html");

            subLink.click(function (event) {
                event.preventDefault();
                localStorage.setItem("destination", JSON.stringify(destinationSearch));
                localStorage.setItem("title", JSON.stringify(destinationData[i].destination));
                $(location).attr("href", "../index.html");
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

// banner section
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


