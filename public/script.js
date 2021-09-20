const socket = io()
const videoGrid = document.getElementById('video-grid')

// const myPeer = new Peer(undefined, {
//         host: 'lms-peer-server.herokuapp.com',
//         port: '443'
//     })
const myPeer = new Peer(undefined, {})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId => {
            if (peers[userId]) {
                peers[userId].close()
            }
        })
        // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            // $(".chat-area").append(`<div class="message-wrapper"><div class="profile-picture"><img src="https://images.unsplash.com/photo-1581824283135-0666cf353f35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1276&q=80" alt="pp"></div><div class="message-content"><p class="name">Ryan Patrick</p><div class="message">${text.val()}</div></div></div>`);
            scrollToBottom()
            text.val('')
        }
    });
    socket.on("createMessage", message => {
        // $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);

        $(".chat-area").append(`<div class="message-wrapper">
        <div class="profile-picture">
            <img src="https://images.unsplash.com/photo-1581824283135-0666cf353f35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1276&q=80" alt="pp">
        </div>
        <div class="message-content">
            <p class="name">Ryan Patrick</p>
            <div class="message">${message}</div>
        </div>
    </div>`);
        scrollToBottom()
    })
})



myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
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

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
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