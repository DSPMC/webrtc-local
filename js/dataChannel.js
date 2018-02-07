// variables associated with send and receive channels
var sendChannel, receiveChannel;
var localPeerConnectionData, remotePeerConnectionData;

// variables associated with demo buttons
var startDataButton = document.getElementById("startDataButton");
var sendDataButton = document.getElementById("sendDataButton");
var closeDataButton = document.getElementById("closeDataButton");

// On startup, just the Start button must be enabled
startDataButton.disabled = false;
sendDataButton.disabled = true;
closeDataButton.disabled = true;

// Associate handlers with buttons
startDataButton.onclick = createConnection;
sendDataButton.onclick = sendData;
closeDataButton.onclick = closeDataChannels;

var dataChannelSend = document.getElementById("dataChannelSend");
var dataChannelReceive = document.getElementById("dataChannelReceive");


function createConnection() {
	initRTCPeerConnection();

	// This is an optional configuration string associated with NAT traversal setup
	var servers = null;

	// variable associated with proper configuration of an RTCPeerConnection object:
	// use DTLS/SRTP
	var pc_constraints = {
		'optional': [
			{'DtlsSrtpKeyAgreement': true}
		]};

	// Create the local PeerConnection object...
	// ...with data channels
	localPeerConnectionData = new RTCPeerConnection(servers, pc_constraints);
	log("Created local peer connection object, with Data Channel");

	try {
		// Note: SCTP-based reliable DataChannels supported in Chrome 29+ !
		// use {reliable: false} if you have an older version of Chrome
		sendChannel = localPeerConnectionData.createDataChannel( "sendDataChannel",
			{reliable: true});
		log('Created reliable send data channel');
	} catch (e) {
		alert('Failed to create data channel!');
		log('createDataChannel() failed with following message: ' + e.message);
	}

	// Associate handlers with peer connection ICE events
	localPeerConnectionData.onicecandidate = gotLocalIceCandidateData;

	// Associate handlers with data channel events
	sendChannel.onopen = handleSendChannelStateChange;
	sendChannel.onclose = handleSendChannelStateChange;

	// Mimic a remote peer connection
	remotePeerConnectionData = new RTCPeerConnection(servers, pc_constraints);
	log('Created remote peer connection object, with DataChannel');

	// Associate handlers with peer connection ICE events...
	remotePeerConnectionData.onicecandidate = gotRemoteIceCandidateData;

	// ...and data channel creation event
	remotePeerConnectionData.ondatachannel = gotReceiveChannel;

	// We're all set! Let's start negotiating a session...
	localPeerConnectionData.createOffer(gotLocalDescriptionData, onSignalingError);

	// Disable Start button and enable Close button
	startDataButton.disabled = true;
	closeDataButton.disabled = false;
}

// Handler for sending data to the remote peer
function sendData() {
	var data = document.getElementById("dataChannelSend").value;
	sendChannel.send(data);
	log('Sent data: ' + data);
}

// Close button handler
function closeDataChannels() {
	// Close channels...
	log('Closing data channels');
	sendChannel.close();
	log('Closed data channel with label: ' + sendChannel.label);
	receiveChannel.close();
	log('Closed data channel with label: ' + receiveChannel.label);

	// Close peer connections
	localPeerConnectionData.close();
	remotePeerConnectionData.close();

	// Reset local variables
	localPeerConnectionData = null;
	remotePeerConnectionData = null;
	log('Closed peer connections');

	// Rollback to the initial setup of the HTML5 page
	startDataButton.disabled = false;
	sendDataButton.disabled = true;
	closeDataButton.disabled = true;

	dataChannelSend.value = "";
	dataChannelReceive.value = "";
	dataChannelSend.disabled = true;
	dataChannelSend.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}

// Handler to be called as soon as the local SDP is made available to the application
function gotLocalDescriptionData(desc) {
	// Set local SDP as the right (local/remote) description for both local and remote parties
	localPeerConnectionData.setLocalDescription(desc);
	log('localPeerConnectionData\'s SDP: \n' + desc.sdp);
	remotePeerConnectionData.setRemoteDescription(desc);

	// Create answer from the remote party, based on the local SDP
	remotePeerConnectionData.createAnswer(gotRemoteDescriptionData, onSignalingError);
}

// Handler to be called as soon as the remote SDP is made available to
// the application
function gotRemoteDescriptionData(desc) {
	// Set remote SDP as the right (remote/local) description for both local and remote parties
	remotePeerConnectionData.setLocalDescription(desc);
	log('Answer from remotePeerConnectionData\'s SDP: \n' + desc.sdp);
	localPeerConnectionData.setRemoteDescription(desc);
}

// Handler to be called whenever a new local ICE candidate becomes available
function gotLocalIceCandidateData(event) {
	log('local ice callback');
	if (event.candidate) {
		remotePeerConnectionData.addIceCandidate(event.candidate);
		log('Local ICE candidate: \n' + event.candidate.candidate);
	}
}

// Handler to be called whenever a new remote ICE candidate becomes available
function gotRemoteIceCandidateData(event) {
	log('remote ice callback');
	if (event.candidate) {
		localPeerConnectionData.addIceCandidate(event.candidate);
		log('Remote ICE candidate: \n ' + event.candidate.candidate);
	}
}

// Handler associated with the management of remote peer connection's
// data channel events
function gotReceiveChannel(event) {
	log('Receive Channel Callback: event --> ' + event);
	// Retrieve channel information
	receiveChannel = event.channel;
	
	// Set handlers for the following events:
	// (i) open; (ii) message; (iii) close
	receiveChannel.onopen = handleReceiveChannelStateChange;
	receiveChannel.onmessage = handleMessage;
	receiveChannel.onclose = handleReceiveChannelStateChange;
}

// Message event handler
function handleMessage(event) {
	log('Received message: ' + event.data);
	// Show message in the HTML5 page
	document.getElementById("dataChannelReceive").value = event.data;
	// Clean 'Send' text area in the HTML page
	document.getElementById("dataChannelSend").value = '';
}

// Handler for either 'open' or 'close' events on sender's data channel
function handleSendChannelStateChange() {
	var readyState = sendChannel.readyState;
	log('Send channel state is: ' + readyState);

	if (readyState == "open") {
		// Enable 'Send' text area and set focus on it
		dataChannelSend.disabled = false;
		dataChannelSend.focus();
		dataChannelSend.placeholder = "";
		// Enable both Send and Close buttons
		sendDataButton.disabled = false;
		closeDataButton.disabled = false;
	} else { // event MUST be 'close', if we are here...
		// Disable 'Send' text area
		dataChannelSend.disabled = true;
		// Disable both Send and Close buttons
		sendDataButton.disabled = true;
		closeDataButton.disabled = true;
	}
}

// Handler for either 'open' or 'close' events on receiver's data channel
function handleReceiveChannelStateChange() {
	var readyState = receiveChannel.readyState;
	log('Receive channel state is: ' + readyState);
}