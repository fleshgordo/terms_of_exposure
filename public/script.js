/******************************************************** 
  ADJUST THESE TIMEOUTS 
********************************************************/
const INACTIVE_TIMEOUT = 10000; // timeout to start slideshow after inactivity (10 seconds)
const SLIDESHOW_TIMER = 10000; // time between images in slideshow (10 seconds)
const POLLING_TIMER = 1000; // time to poll for new images (1 second)

let lastImages = [];
let lastImagesSlideshow = [];
let timer = null;
let slideshowInterval = null;
let isSlideShowplaying = false;
const DEBUG = true;

function fetchImages() {
  return fetch(`/images`)
    .then((res) => res.json())
    .then((images) => {
      const changed = JSON.stringify(images) !== JSON.stringify(lastImages);
      if (changed) {
        if (DEBUG)
          console.log(
            `showImage1: ${images[0].file} \nshowImage2: ${images[1].file}\nchanged?: ${changed}`
          );
        stopSlideshow(); // Stop the slideshow interval
        lastImages = images;
        resetTimer(); // Reset the inactivity timer when new images are detected
        showImages(images);
      }
    });
}
function fetchImageSlideshow() {
  return fetch(`/images?mode=slideshow`)
    .then((res) => res.json())
    .then((images) => {
      //if (DEBUG) console.log("fetchImageSlideshow", images, lastImages, changed);
      showImages(images);
      lastImagesSlideshow = images;
    });
}
function showImages(images) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  if (DEBUG)
    console.log(
      `showImage1: ${images[0].file} \nshowImage2: ${images[1].file}`
    );
  images.forEach((img) => {
    const el = document.createElement("img");
    el.src = `/uploads/${img.file}`;
    gallery.appendChild(el);
  });
}

function clearTimer() {
  clearTimeout(timer);
}
function resetTimer() {
  clearTimeout(timer);
  if (DEBUG) console.log("resetTimer");
  if (!isSlideShowplaying) {
    timer = setTimeout(() => startSlideshow(), INACTIVE_TIMEOUT);
  }
}

function startSlideshow() {
  if (DEBUG) console.log("-- startSlideshow");
  stopSlideshow(); // Ensure no duplicate intervals
  slideshowInterval = setInterval(() => {
    fetchImageSlideshow();
    isSlideShowplaying = true;
    console.log("*** STARTED Slideshow interval ***");
  }, SLIDESHOW_TIMER);
}

function stopSlideshow() {
  if (DEBUG) console.log("-- stopSlideshow");
  isSlideShowplaying = false;
  clearInterval(slideshowInterval);
  console.log("*** CLEARED Slideshow interval ***");
  slideshowInterval = null;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchImages();
  resetTimer();
  // Poll every second
  setInterval(() => {
    fetchImages();
  }, POLLING_TIMER);
});
