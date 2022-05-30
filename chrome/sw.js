chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        init()
    }
});

async function init() {
    let tabs = await chrome.tabs.query({ active: true });

    if (tabs[0].url.includes("lecturecapture.sliit.lk")) {
        // get saved values
        let { playbackSpeed } = await chrome.storage.sync.get(['playbackSpeed'])
        let { scroll } = await chrome.storage.sync.get(["scroll"]);
        let { header } = await chrome.storage.sync.get(["header"]);
        let { dark } = await chrome.storage.sync.get(["dark"]);
        let { tweaks } = await chrome.storage.sync.get(["tweaks"]);

        console.log("speed", playbackSpeed)
        //  set saved options
        if (playbackSpeed) {
            setPlaybackSpeed(playbackSpeed);
        }

        if (scroll) {
            setScroll(scroll);
        }

        if (header) {
            setHeader(header);
        }

        if (dark) {
            setDark(dark);
        }

        if (tweaks) {
            setTweaks(tweaks);
        }
    }
}

/*
*
* ------------------------------ 
* | Injectors
* ------------------------------
*
*/


// set playback speed
async function setPlaybackSpeed(speed) {
    let tabs = await chrome.tabs.query({ active: true });

    chrome.scripting.executeScript({
        target: { tabId: tabs[0].id, allFrames: true },
        func: function (speed2) {
            videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
            console.log(videoElements)
            Array.prototype.forEach.call(videoElements, function (elm) {
                elm.playbackRate = speed2;
            });
        },
        args: [speed]
    });
}

// set scrolling behaviour
async function setScroll(state) {
    let tabs = await chrome.tabs.query({ active: true });
    if (state == 1) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            func: () => {
                window.addEventListener('keydown', function (e) {
                    if (e.keyCode == 32) {
                        e.preventDefault();
                    }
                });
            },
        });
    }
}

// show and hide the header
async function setHeader(state) {
    let tabs = await chrome.tabs.query({ active: true });
    if (state == 0) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            files: ['./scripts/headerHide.js'],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            files: ['./scripts/headerShow.js'],
        });
    }
}

// set dark theme
async function setDark(state) {
    let tabs = await chrome.tabs.query({ active: true });
    if (state == 0) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            files: ['./scripts/darkThemeRemove.js'],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            files: ['./scripts/darkThemeSet.js'],
        });
    }
}

// set UI Tweaks
async function setTweaks(state) {
    let tabs = await chrome.tabs.query({ active: true });

    if (state == 0) {
        console.log("off");
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            files: ['./scripts/tweaksSet.js'],
        });
    }
}

/*
*
* ------------------------------ 
* | Message Listeners
* ------------------------------
*
*/

chrome.runtime.onConnect.addListener(async (port) => {
    // send back saved time
    console.log(port.sender.tab.id)
    let { currentTime } = await chrome.storage.sync.get(['currentTime']);
    console.log("time", currentTime)
    // port.postMessage({ timestamp: currentTime })

    if (currentTime) {
        chrome.scripting.executeScript({
            target: { tabId: port.sender.tab.id, allFrames: true },
            func: function (time) {
                videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
                Array.prototype.forEach.call(videoElements, function (elm) {
                    elm.play()
                    elm.currentTime = time;
                });
            },
            args: [currentTime]
        });
    }

    port.onMessage.addListener(async (msg) => {
        if (msg.currentTime) {
            console.log(msg.currentTime)
            await chrome.storage.sync.set({ "currentTime": msg.currentTime })
        }
    });

});