document.addEventListener("DOMContentLoaded", () => {
    const VIDEO_PATH = "../AuuughSMP/Taunt.mp4"; 
    const TAUNT_VOLUME = 0.1;
    const TARGET_COLOR = { r: 0, g: 133, b: 66 };
    const TOLERANCE = 60; 

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
        video.volume = TAUNT_VOLUME;
        video.playsInline = true;
        
        video.crossOrigin = "anonymous"; 

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

            const width = video.videoWidth;
            const height = video.videoHeight;

            if (width === 0 || height === 0) {
                animationFrameId = requestAnimationFrame(processFrame);
                return;
            }

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            ctx.drawImage(video, 0, 0, width, height);

            const frame = ctx.getImageData(0, 0, width, height);
            const data = frame.data;
            const length = data.length;

            for (let i = 0; i < length; i += 4) {
                const rDiff = Math.abs(data[i] - TARGET_COLOR.r);
                const gDiff = Math.abs(data[i + 1] - TARGET_COLOR.g);
                const bDiff = Math.abs(data[i + 2] - TARGET_COLOR.b);

                if (rDiff + gDiff + bDiff < TOLERANCE) {
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
