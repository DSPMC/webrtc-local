// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
	navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices.
// We can't just assign an object with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  	navigator.mediaDevices.getUserMedia = function(constraints) {

    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error to keep a consistent interface
    if (!getUserMedia) {
    	return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      	getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

var video = document.querySelector('video');
var stream;
var vgaButton = document.querySelector("button#vga");
var qvgaButton = document.querySelector("button#qvga");
var hdButton = document.querySelector("button#hd");

// Use constraints to ask for a video-only MediaStream:
var constraints = {
	audio: false, 
	video: {
		width: { min: 400 },
    	height: { min: 300 }
    }
};

// Constraints object for low resolution video
var qvgaConstraints = {
	video: {
		width: { min: 320, ideal: 320 },
    	height: { min: 240, ideal: 240 }
	}
};

// Constraints object for standard resolution video
var vgaConstraints = {
	video: {
		width: { min: 640, ideal: 640 },
    	height: { min: 480, ideal: 480 }
	}
};

// Constraints object for high resolution video
var hdConstraints = {
	video: {
		width: { min: 640, ideal: 1280 },
    	height: { min: 480, ideal: 960 }
	}
};

// Callback to be called in case of success...
function successCallback(mediaStream) {
	stream = mediaStream;

	if ("srcObject" in video) {
	    video.srcObject = mediaStream;
  	} else {
	    // Avoid using this in new browsers, as it is going away.
	    video.src = window.URL.createObjectURL(mediaStream);
  	}

  	video.onloadedmetadata = function(e) {
	    video.play();
  	};
}

// Callback to be called in case of failures...
function errorCallback(error){
	console.log("navigator.getUserMedia error: ", error);
}

// Main action: just call getUserMedia() on the navigator object
function getMedia(constraints) {
	if (!!stream) {
		if ("srcObject" in video) {
	    	video.srcObject = null;
	  	} else {
		    // Avoid using this in new browsers, as it is going away.
		    video.src = null;
	  	}
		stream.getVideoTracks()[0].stop();
	}

	navigator.mediaDevices.getUserMedia(constraints).then(successCallback).catch(errorCallback);
}

// Associate actions with buttons:
qvgaButton.onclick = function(){getMedia(qvgaConstraints)};
vgaButton.onclick = function(){getMedia(vgaConstraints)};
hdButton.onclick = function(){getMedia(hdConstraints)};