const socket = io("https://roomgap.iran.liara.run");

socket.on('update', data => console.log(data))
socket.on('connect_error', err => console.log(err))
socket.on('connect_failed', err => console.log(err))
socket.on('disconnect', err => console.log(err))

let isAlreadyCalling = false;
let getCalled = true;
let myStream;

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

let userAgent = navigator.userAgent;

if (userAgent.match(/firefox|fxios/i)) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true, })
        .then((stream) => { startlocalCamera(stream) })
        .catch((error) => { console.log(error) });

} else if (userAgent.match(/chrome|chromium|crios/i)) {
    navigator.getUserMedia({ video: true, audio: true },
        (stream) => { startlocalCamera(stream) },
        (error) => { console.log(error) });
}

function startlocalCamera(stream) {
    const localVideo = document.getElementById("local-video");
    myStream = stream;

    if (localVideo) {
        localVideo.srcObject = stream;
    }
    else {
        localVideo.current.src = window.URL.createObjectURL(stream);
    }

    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

}

async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("call-user", {
        offer,
        to: socketId,
    });
}

function createUserItems(user) {
    let cb = `
        <div id='${user.socketId}'>
            <div class="chat chat-left" style="cursor:pointer">
                <span>
                    <span class="chat-avatar-sm user-img">
                        <img src="img/user.jpg" alt="" class="rounded-circle">
                        <span class="status ${user.status}"></span>
                    </span> <h4>${user.username}</h4> 
                </span>
            </div>
            <div class="chat-line" style="margin-top: 15px;"> </div>
        </div>
    `;
    $(".chats").append(cb);

    document.getElementById(user.socketId).addEventListener("click", (env) => {
        unselectUser();
        callUser(user.socketId);
        // elm.setAttribute("class", "active");
        // elm.setAttribute("style", "pointer-events: none;");
    })

}

function unselectUser() {
    const alreadySelectedUser = document.querySelectorAll(
        ".active-user.active-user--selected"
    );

    alreadySelectedUser.forEach((element) => {
        element.setAttribute("class", "active-user");
    });
}

function updateUserList(users) {
    const activeUserContainer = document.getElementById(
        "active-user-container"
    );
    users.forEach((socketId) => {
        const userExist = document.getElementById(socketId.sid);

        if (!userExist) {
            const userContainer = createUserItems(socketId);

            // activeUserContainer.appendChild(userContainer);
        }
    });
}

var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

socket.emit('SetUsername', document.cookie.split('=')[1])

socket.on("update-user-list", ({ users }) => {
    updateUserList(users);
});

socket.on("remove-user", ({ socketId }) => {
    const user = document.getElementById(socketId);

    if (user) {
        user.remove();
    }
});

socket.on("call-made", async (data) => {
    if (getCalled) {

        // Incoming call popup
        if ($('#incoming_call').length > 0) {
            $('#incoming_call').modal('show');
        }

        window.onclick = async function (event) {
            if (event.target.id == 'decline') {
                socket.emit("reject-call", {
                    from: data.socket,
                });

                $('#incoming_call').modal('hide');

                return;
            }
            else if (event.target.id == 'answer') {
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.offer)
                );

                const answer = await peerConnection.createAnswer();

                await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

                document.getElementById('NameContact').innerText = data.username.username;

                $('#incoming_call').modal('hide');

                setInterval(setTime, 1000);

                socket.emit("make-answer", {
                    answer,
                    to: data.socket,
                });
            }

        }

    }


    getCalled = false;
});

socket.on("answer-made", async (data) => {

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    document.getElementById('NameContact').innerText = data.username.username;
    setInterval(setTime, 1000);

    if (!isAlreadyCalling) {
        callUser(data.socket);
        isAlreadyCalling = true;
    }
});

socket.on("call-rejected", (data) => {
    alert(`کاربر با شناسه ${data.socket} تماس شما را قبول نکرد!`);
    unselectUser();
});

peerConnection.ontrack = function ({ streams: [stream] }) {
    const remoteVideo = document.getElementById("remote-video");

    if (remoteVideo) {
        remoteVideo.srcObject = stream;
    }
};


function fullscreen(event) {
    event.preventDefault();
    var element = document.querySelector(".chat-view");

    if (document.fullscreenElement !== null) {
        document.exitFullscreen()
            .then(() => { fullsc = false; })
            .catch((error) => { console.log(error.message); });
    } else {
        element.requestFullscreen()
            .then(() => { fullsc = true; })
            .catch((error) => { console.log(error.message); });

    }
}

function toggleVideo(event) {
    event.preventDefault();
    myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
}

function toggleMic(event) {
    event.preventDefault();
    myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
} 