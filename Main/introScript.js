const video = document.getElementById('intro-video');
const videoContainer = document.getElementById('video-container');
const mapContainer = document.getElementById('map-container');
const bgMusic = document.getElementById('bg-music'); // New audio element

video.volume = 0.2; 
bgMusic.volume = 0.1;

function switchToMap() {
  video.pause();
  videoContainer.style.display = 'none';
  mapContainer.style.display = 'flex';

  bgMusic.play().catch(error => {
    console.log("Audio autoplay was prevented by the browser. It will play upon user interaction.", error);
  });
}

video.addEventListener('ended', switchToMap);

videoContainer.addEventListener('click', switchToMap);