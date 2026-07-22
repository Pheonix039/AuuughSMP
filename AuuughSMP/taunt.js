document.addEventListener("DOMContentLoaded", () => {
    // 1. UPDATE THIS PATH to your video file location!
    const VIDEO_PATH = "../AuuughSMP/Taunt.mp4"; 

    // Target your button
    const tauntBtn = document.querySelector(".pheoTauntBtn");
    if (!tauntBtn) return;

    // Green screen settings
    const keyColor = { r: 0, g: 255, b: 0 }; // Target Green
    const tolerance = 70; // Adjust if edges are messy (higher = removes more green)

    tauntBtn.addEventListener("click", (e) => {
        e.preventDefault();
        playChromaVideo(VIDEO_PATH);
    });

    function playChromaVideo(videoSrc) {
        if (document.getElementById("chroma-overlay")) return;

        // Create HTML5 Video & Canvas elements dynamically
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        video.src = videoSrc;
        video.crossOrigin = "anonymous";
        video.playsInline = true;

        // Overlay setup to render above your site
        const overlay = document.createElement("div");
        overlay.id = "chroma-overlay";
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: "99999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        });

        Object.assign(canvas.style, {
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain"
        });

        overlay.appendChild(canvas);
        document.body.appendChild(overlay);

        // Start video process when ready
        video.addEventListener("loadedmetadata", () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            video.play().catch(err => {
                console.error("Video play error:", err);
                overlay.remove();
            });
            
            requestAnimationFrame(processFrame);
        });

        // Error handling if video path is wrong
        video.addEventListener("error", () => {
            console.error("Could not load video at:", videoSrc);
            overlay.remove();
            alert("Video file couldn't be loaded. Check your video file path!");
        });

        // Render loop for Chroma Keying
        function processFrame() {
            if (video.paused || video.ended) {
                overlay.remove();
                video.remove();
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = frame.data;
            const len = data.length;

            for (let i = 0; i < len; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check for green key pixels
                if (
                    Math.abs(r - keyColor.r) < tolerance &&
                    g > 90 &&
                    Math.abs(b - keyColor.b) < tolerance
                ) {
                    data[i + 3] = 0; // Turn alpha channel transparent
                }
            }

            ctx.putImageData(frame, 0, 0);
            requestAnimationFrame(processFrame);
        }
    }
});