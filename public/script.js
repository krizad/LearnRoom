const socket = io()
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
        // host: 'lms-peer-server.herokuapp.com',
        // port: '443'
    })
    // const myPeer = new Peer(undefined, {})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
var name;

var screenStream;
var screenSharing = false
var userId;
var currentPeer = null;
var id;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    $("#muteButt").click()
    $("#playButt").click()
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)

        })

    })

    myPeer.on('open', id => {
        id = id;
        name = prompt("What's your name?")
        socket.emit('join-room', ROOM_ID, id, name)
    })

    socket.on('user-connected', (userId, userName) => {
        console.log(userName + ' Connect to this room')
        connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close()
        }
        console.log(userId)
    })

    // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            sendMessage(text)
        }
    });

    $('#sendButton').on('click', function() {
        sendMessage(text)
    });

    socket.on("createMessage", (message, userName) => {
        // $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);

        $(".chat-area").append(`<div class="message-wrapper">
        <div class="message-content">
            <p class="name">${userName}</p>
            <div class="message">${message}</div>
        </div>
    </div>`);
        scrollToBottom()
    })

    $("#fullscreenButt").on("click", function() {
        toggleFullScreen()
    })

    $("#leaveButt").on("click", function() {
        window.close();

    })

})



function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    userId = userId;
    peers[userId] = call
    currentPeer = call;
    console.log(currentPeer)


}

function addVideoStream(video, stream) {

    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
        // $("#video-grid").sortable();

}

function sendMessage(text) {
    socket.emit('message', text.val());
    $(".chat-area").append(`<div class="message-wrapper reverse">
    <div class="message-content">
        <p class="name">` + name + `</p>
        <div class="message">${text.val()}</div>
        </div></div>`);
    scrollToBottom()
    text.val('')
}

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
}


const scrollToBottom = () => {
    var d = $('.chat-area');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    // console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span></span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span></span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span></span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span></span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

function startScreenShare() {

    if (screenSharing) {
        stopScreenSharing()
    }
    const shareVideo = document.createElement('video')
    shareVideo.muted = true;

    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        screenStream = stream;
        addVideoStream(shareVideo, stream)

        socket.emit('share-screen', ROOM_ID, id, "name")

        myPeer.on('call', call => {
            call.answer(stream)
            const videosteam = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(videosteam, userVideoStream)

            })

        })
        socket.on('user-connected', (userId, userName) => {
            console.log(userName + ' Connect to this room')
            const call = myPeer.call(userId, stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove()
            })
            peers[userId] = call

        })


    })

    // navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    //     screenStream = stream;
    //     let videoTrack = screenStream.getVideoTracks()[0];
    //     videoTrack.onended = () => {
    //         stopScreenSharing()
    //     }

    //     const video = document.createElement('video')
    //     socket.emit('join-room', ROOM_ID, "idshare", 'nameshare')
    //     addVideoStream(video, screenStream)
    //     screenSharing = true
    //         // if (myPeer) {
    //         //     let sender = currentPeer.peerConnection.getSenders().find(function(s) {
    //         //         return s.track.kind == videoTrack.kind;
    //         //     })
    //         //     sender.replaceTrack(videoTrack)
    //         //     screenSharing = true
    //         // }
    // })
}

function stopScreenSharing() {
    if (!screenSharing) return;
    let videoTrack = myVideoStream.getVideoTracks()[0];

    if (myPeer) {
        let sender = currentPeer.peerConnection.getSenders().find(function(s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    screenStream.getTracks().forEach(function(track) {
        track.stop();
    });
    screenSharing = false
}