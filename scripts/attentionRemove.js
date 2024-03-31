(() => {
    let eplayer = document.getElementById("eplayer_iframe");

    if (eplayer) {
        const videoContainer = eplayer.contentWindow.document.getElementById("main-video-container").parentElement

        videoContainer.style.display = "block";

        let node = eplayer.contentWindow.document.getElementById("attention-lock-container")

        if (node) {
            node.remove()
        }
    }
})()
