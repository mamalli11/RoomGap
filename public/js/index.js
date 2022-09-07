const socket = io("192.168.1.8:9000");

let isAlreadyCalling = false;
let getCalled = false;

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

let userAgent = navigator.userAgent;

if (userAgent.match(/firefox|fxios/i)) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true, })
        .then((stream) => { startlocalCamera(stream) })
        .catch((err) => { console.log(err) });

} else if (userAgent.match(/chrome|chromium|crios/i)) {
    navigator.getUserMedia({ video: true, audio: true },
        (stream) => { startlocalCamera(stream) },
        (error) => { console.log(err) });
}

function startlocalCamera(stream) {
    const localVideo = document.getElementById("local-video");

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
                        <span class="status online"></span>
                    </span> <h4>${user.username}</h4> 
                </span>
            </div>
            <div class="chat-line" style="margin-top: 15px;"> </div>
        </div>
    `;
    $(".chats").append(cb);

    document.getElementById(user.socketId).addEventListener("click", (env) => {
        unselectUser();
        document.getElementById('NameContact').innerText = env.value;

        // userContainer.setAttribute(
        //     "class",
        //     "active-user active-user--selected",
        // );
        // userContainer.setAttribute("style", "pointer-events: none;")
        console.log(env);
        // const talkingWithInfo = document.getElementById("talking-with-info");
        // talkingWithInfo.innerHTML = `صحبت با : سوکت ${socketId}`;
        callUser(user.socketId);
    });
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
        const confirmed = confirm(
            `کاربر با شناسه ${data.socket} می خواهد با شما تماس بگیرد . قبول می نماِیید؟`
        );

        if (!confirmed) {
            socket.emit("reject-call", {
                from: data.socket,
            });

            return;
        }
        document.getElementById('NameContact').innerText = data.username.username;
    }


    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
        answer,
        to: data.socket,
    });

    getCalled = true;
});

socket.on("answer-made", async (data) => {


    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

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


