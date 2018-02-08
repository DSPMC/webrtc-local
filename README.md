# Sample of WebRTC Application

## Introduction
This application is based on WebRTC book writen by Savatore & Simon (2014) with several changes to make it works in current browsers (~2018). For best result, it's better to use [WebRTC Adapter][webrtc-adapter] provided by WebRTC team. But, it's still proper to use only these scripts for getting started with WebRTC. Next step, you can [learn more][webrtc-sample] from many examples provided by WebRTC team.
This application just simulate a WebRTC communication between two entities in a single host and application runtime. In real case of WebRTC implementation, you need a signaling server to exchange the SDP between two or more parties.

## Environment Setup
You must install a web server locally or in public to access the scripts and run the application. While Mozilla browser still has support to run WebRTC application through direct file access from your local computer, it's not good practice in learning WebRTC. Real application is mostly accessed from a web server in the public internet. So, several steps that a beginner possibly need are as follows.
1. Install a web server (XAMPP) on your computer
2. Configure a host in your web server to point to your application directory
3. Setup a self-signed SSL certificate and enable it for your host. If you use XAMPP, it's available at `<your-xampp-folder>/apache/conf/ssl.<crt|key>/server.<crt|key>`
4. Restart your web server and try to access `https://localhost` or another domain name you assigned

## Application
1. `index.html` with `getUserMedia.js` is only a sample of getUserMedia method implementation.
2. `local.html` with `localPeerConnection.js` and `dataChannel.js` is sample of communication process between two entities.

[webrtc-adapter]: https://github.com/webrtc/adapter
[webrtc-sample]: https://github.com/webrtc/samples
