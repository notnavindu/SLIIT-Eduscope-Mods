(() => {
    let parentFrame = document.getElementById("eplayer_iframe")
    if (parentFrame) {
        parentFrame.style.position = "relative"
        parentFrame.style.width = "100%"
        parentFrame.style.height = "624px"
    }

    let mainPlayer = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByClassName("mainPlayer")[0]

    if (mainPlayer) {
        mainPlayer.style.paddingTop = "56.25%";
        mainPlayer.style.width = "100%";
        mainPlayer.style.height = "0px"
    }
})()
