document.addEventListener("DOMContentLoaded", () => {
    // 1. UPDATE THIS PATH to your MP4 location!
    const VIDEO_PATH = "../AuuughSMP/Taunt.mp4"; 

    // 2. SET VOLUME HERE (0.0 = muted, 0.5 = 50% volume, 1.0 = full volume)
    const TAUNT_VOLUME = 0.1;

    // 3. TARGET CHROMA KEY COLOR (#2596be in RGB: R:37, G:150, B:190)
    const TARGET_COLOR = { r: 37, g: 150, b: 190 };
    
    // Increased tolerance to catch compressed video artifacts (range: 150 - 220 works best)
    const TOLERANCE = 180; 

    // Target your button
    const tauntBtn = document.querySelector(".pheoTauntBtn");
    if (!tauntBtn) return;

    tauntBtn.addEventListener("click", (e) => {
        e.preventDefault();
        playTauntAnimation();
    });

    function playTauntAnimation() {
        // Prevent stacking overlays if clicked multiple times fast
        if (document.getElementById("taunt-overlay")) return;

        // Create the Overlay container
        const overlay = document.createElement("div");
        overlay.id = "taunt-overlay";
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
            justifyContent: "center",
            overflow: "hidden"
        });

        // Create offscreen Video element
        const video = document.createElement("video");
        video.src = VIDEO_PATH;
        video.volume = TAUNT_VOLUME;
        video.playsInline = true;
        
        // ENABLED for web hosting / GitHub Pages
        video.crossOrigin = "anonymous"; 

        // Create Canvas element to render keyframed video
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        Object.assign(canvas.style, {
            width: "100vw",
            height: "100vh",
            objectFit: "cover"
        });

        overlay.appendChild(canvas);
        document.body.appendChild(overlay);

        let animationFrameId;

        // Chroma key rendering loop
        function processFrame() {
            if (video.paused || video.ended) return;

            const width = video.videoWidth;
            const height = video.videoHeight;

            // Wait until video has valid dimensions before drawing
            if (width === 0 || height === 0) {
                animationFrameId = requestAnimationFrame(processFrame);
                return;
            }

            // Sync canvas resolution to natural video dimensions
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, width, height);

            // Extract pixel data
            const frame = ctx.getImageData(0, 0, width, height);
            const data = frame.data;
            const length = data.length;

            // Optimized color distance check
            for (let i = 0; i < length; i += 4) {
                const rDiff = Math.abs(data[i] - TARGET_COLOR.r);
                const gDiff = Math.abs(data[i + 1] - TARGET_COLOR.g);
                const bDiff = Math.abs(data[i + 2] - TARGET_COLOR.b);

                // If total difference is within tolerance, make pixel transparent
                if (rDiff + gDiff + bDiff < TOLERANCE) {
                    data[i + 3] = 0; // Set Alpha to 0
                }
            }

            // Write processed frame back to canvas
            ctx.putImageData(frame, 0, 0);

            // Loop on next frame
            animationFrameId = requestAnimationFrame(processFrame);
        }

        // Event listeners for lifecycle control
        video.addEventListener("play", () => {
            processFrame();
        });

        video.addEventListener("ended", cleanup);

        video.addEventListener("error", () => {
            console.error("Could not load video file at:", VIDEO_PATH);
            alert("Video file couldn't be loaded! Check your VIDEO_PATH in taunt.js");
            cleanup();
        });

        // Start playback
        video.play().catch(err => {
            console.error("Video failed to play:", err);
            cleanup();
        });

        function cleanup() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (overlay) overlay.remove();
            video.remove();
        }
    }
});
