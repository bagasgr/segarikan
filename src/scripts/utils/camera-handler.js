// src/utils/camera-handler.js

let currentStream = null;

async function startCamera(videoElement, facingMode = 'environment') {
  try {
    // Stop existing stream if any
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;
    await videoElement.play();

    return true;
  } catch (err) {
    console.error('startCamera error:', err);
    currentStream = null;
    return false;
  }
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

export { startCamera, stopCamera };
