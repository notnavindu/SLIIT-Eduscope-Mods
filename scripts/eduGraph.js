(() => {
    let eplayer = document.getElementById("eplayer_iframe");

    if (eplayer) {
        let video = eplayer.contentWindow.document.getElementsByTagName("video")[0];

        video.addEventListener("play", () => {
            chrome.runtime.sendMessage({ play: true }, function (response) {
                console.log(response);
            });
        })

        video.addEventListener("pause", () => {
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