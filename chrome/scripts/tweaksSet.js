(() => {
    document.getElementsByTagName("body")[0].style.fontFamily = "Arial";

    let eplayer = document.getElementById("eplayer_iframe");

    // comment button
    let submitButton = document.getElementById("comment_submit")
    if (submitButton) {
        submitButton.style.borderRadius = "7px";
        submitButton.style.marginTop = "15px";
        submitButton.style.backgroundColor = "#121212";
        submitButton.style.border = "2px solid #0388fc";
    }

    // video frame
    if (eplayer) {
        eplayer.style.border = "2px solid #002647";
        eplayer.contentWindow.document.documentElement.style.backgroundColor = "#121212";

        controlBar = eplayer.contentWindow.document.querySelector(".video-react-control-bar-auto-hide");
        controlBar.style.height = "45px";
        controlBar.style.fontSize = "1.4em";
        controlBar.style.marginBottom = "15px";
        controlBar.style.backgroundColor = "#121212";
        controlBar.style.opacity = "0.9";
        controlBar.style.borderRadius = "7px";
        controlBar.style.border = "1px solid #0388fc";

        // handle mouse over
        player = eplayer.contentWindow.document.querySelector(".video-react-control-bar-auto-hide")
        eplayer.onmouseover = eplayer.onmouseout = handler;

        // On Time update
        let video = eplayer.contentWindow.document.getElementsByTagName("video")[0];

        let loop;

        chrome.runtime.sendMessage({ connect: true }, function (response) {
            console.log(response);
        });

        video.addEventListener("play", () => {
            loop = setInterval(async () => {
                try {
                    // if (!port) {
                    //     console.log("port is null");
                    //     port = await chrome.runtime.connect({ name: "timestamp" })
                    // } else {
                    //     port.postMessage({ currentTime: video.currentTime });
                    // }
                    chrome.runtime.sendMessage({ currentTime: video.currentTime }, function () { });
                } catch (error) { console.log("Page Refresh Required", error) }
            }, 1000)
        })

        video.addEventListener("pause", () => {
            clearInterval(loop)
        })

        // extension port disconnect event
        // port.onDisconnect.addListener(() => {
        //     console.log("port disconnected")
        //     port = null;
        // })



    }

    function handler(event) {
        controlBar = document.getElementById("eplayer_iframe").contentWindow.document.querySelector(".video-react-control-bar-auto-hide");
        if (event.type == 'mouseover') {
            controlBar.style.opacity = 0.9;
        }
        if (event.type == 'mouseout') {
            controlBar.style.opacity = 0;
        }
    }
})()
