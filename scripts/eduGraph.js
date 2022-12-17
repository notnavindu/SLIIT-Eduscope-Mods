var edugraphInit = false;
(() => {
    // var test;
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

        setInterval(async () => {
            try {
                chrome.runtime.sendMessage({ autoSave: true }, function () { });
            } catch (error) { console.log("Page Refresh Required", error) }
        }, 1000 * 60 * 1)
    }

    let user = document.getElementById("dropdown08")?.text?.replace("(Logout)", "")?.trim();

    chrome.runtime.sendMessage({ studentId: user }, function (response) {
        console.log(response);
    });

})()