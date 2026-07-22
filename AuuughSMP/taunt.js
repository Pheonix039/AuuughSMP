document.addEventListener("DOMContentLoaded", () => {
    const VIDEO_PATH = "../AuuughSMP/Taunt.mp4"; 
    const TAUNT_VOLUME = 0.3;

    const TARGET_COLOR = { r: 37, g: 150, b: 190 };
    const TOLERANCE = 90;

    const tauntBtn = document.querySelector(".pheoTauntBtn");
    if (!tauntBtn) return;

    tauntBtn.addEventListener("click", (e) => {
        e.preventDefault();
        playTauntAnimation();
    });

    function playTauntAnimation() {
        if (document.getElementById("taunt-overlay")) return;

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

        const video = document.createElement("video");
        video.src = VIDEO_PATH;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        // FIX: Wait for video metadata to load before setting volume
        video.addEventListener("loadedmetadata", () => {
            video.volume = TAUNT_VOLUME;
        });

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

        function processFrame() {
            if (video.paused || video.ended) return;

            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = frame.data;
            const length = data.length;

            for (let i = 0; i < length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const colorDistance = Math.sqrt(
                    Math.pow(r - TARGET_COLOR.r, 2) +
                    Math.pow(g - TARGET_COLOR.g, 2) +
                    Math.pow(b - TARGET_COLOR.b, 2)
                );

                if (colorDistance < TOLERANCE) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(frame, 0, 0);
            animationFrameId = requestAnimationFrame(processFrame);
        }

        video.addEventListener("play", () => {
            processFrame();
        });

        video.addEventListener("ended", cleanup);

        video.addEventListener("error", () => {
            console.error("Could not load video file at:", VIDEO_PATH);
            alert("Video file couldn't be loaded! Check your VIDEO_PATH in taunt.js");
            cleanup();
        });

        // Backup volume set right before play execution
        video.volume = TAUNT_VOLUME;

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
});document.addEventListener("DOMContentLoaded", () => {
    // 1. UPDATE THIS PATH to your MP4 location!
    const VIDEO_PATH = "../AuuughSMP/Taunt.mp4"; 

    // 2. SET VOLUME HERE (0.0 = muted, 0.5 = 50% volume, 1.0 = full volume)
    const TAUNT_VOLUME = 0.00;

    // 3. TARGET CHROMA KEY COLOR (#2596be in RGB: R:37, G:150, B:190)
    const TARGET_COLOR = { r: 37, g: 150, b: 190 };
    const TOLERANCE = 90; // Sensitivity for matching color variations (adjust if needed)

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
        video.crossOrigin = "anonymous"; // Prevents canvas security errors if hosted on CDN

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

            // Match canvas rendering resolution to video native resolution
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Extract pixel data
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = frame.data;
            const length = data.length;

            // Loop through pixels and apply alpha mask to target color
            for (let i = 0; i < length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Calculate distance from target color
                const colorDistance = Math.sqrt(
                    Math.pow(r - TARGET_COLOR.r, 2) +
                    Math.pow(g - TARGET_COLOR.g, 2) +
                    Math.pow(b - TARGET_COLOR.b, 2)
                );

                if (colorDistance < TOLERANCE) {
                    data[i + 3] = 0; // Set Alpha to fully transparent
                }
            }

            // Write processed frame back to canvas
            ctx.putImageData(frame, 0, 0);

            // Loop on next frame request
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
