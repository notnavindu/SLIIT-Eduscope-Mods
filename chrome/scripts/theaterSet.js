(() => {
    let parentFrame = document.getElementById("eplayer_iframe")
    if (parentFrame) {
        parentFrame.style.position = "fixed"
        parentFrame.style.top = "0"
        parentFrame.style.left = "0"
        parentFrame.style.width = "100%"
        parentFrame.style.height = "100vh"
        parentFrame.style.zIndex = "9999"
    }

    let mainPlayer = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByClassName("mainPlayer")[0]

    if (mainPlayer) {
        mainPlayer.style.padding = "0";
        mainPlayer.style.width = "100%";
        mainPlayer.style.height = "100vh"
    }
})()
