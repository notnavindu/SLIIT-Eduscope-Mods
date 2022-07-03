(() => {
    let eplayer = document.getElementById("eplayer_iframe");

    if (eplayer) {
        console.log("Analytics connected");

        let video = eplayer.contentWindow.document.getElementsByTagName("video")[0];

        video.addEventListener("play", () => {
            console.log("Plaay")
            chrome.runtime.sendMessage({ play: true }, function (response) {
                console.log(response);
            });
        })

        video.addEventListener("pause", () => {
            console.log("Pauuuse")
            chrome.runtime.sendMessage({ pause: true }, function (response) {
                console.log(response);
            });
        })
    }

    let user = document.getElementById("dropdown08")?.text?.replace("(Logout)", "")?.trim();
    chrome.runtime.sendMessage({ studentId: user }, function (response) {
        console.log(response);
    });

})()