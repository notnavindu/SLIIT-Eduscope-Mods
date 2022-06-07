try {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        console.log(tab)
        if (changeInfo.status === "complete") {
            init(tab)
        }
    });
} catch (error) {
    console.log(error);
}

async function init(tab) {

    console.log("check", tab.url)

    if (tab.url.includes("lecturecapture.sliit.lk")) {
        // get saved values
        let { scroll } = await chrome.storage.sync.get(["scroll"]);
        let { dark } = await chrome.storage.sync.get(["dark"]);
        let { tweaks } = await chrome.storage.sync.get(["tweaks"]);
        let { theater } = await chrome.storage.sync.get(["theater"]);

        if (scroll) {
            setScroll(scroll, tab.id);
        }

        if (dark) {
            setDark(dark, tab.id);
        }

        if (tweaks) {
            setTweaks(tweaks, tab.id);
        }

        if (theater) {
            setTheaterMode(theater, tab.id);
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
async function setPlaybackSpeed(speed, tabId) {

    chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        func: function (speed2) {
            videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
            Array.prototype.forEach.call(videoElements, function (elm) {
                elm.playbackRate = speed2;
            });
        },
        args: [speed]
    });
}

// set scrolling behaviour
async function setScroll(state, tabId) {
    if (state == 1) {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
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

// set dark theme
async function setDark(state, tabId) {
    if (state == 0) {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ['./scripts/darkThemeRemove.js'],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ['./scripts/darkThemeSet.js'],
        });
    }
}

// set UI Tweaks
async function setTweaks(state, tabId) {

    if (state == 0) {
        console.log("off");
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ['./scripts/tweaksSet.js'],
        });
    }
}

// set Theater mode
async function setTheaterMode(state, tabId) {

    if (state == 0) {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ['./scripts/theaterRemove.js'],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ['./scripts/theaterSet.js'],
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

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        // initial request
        if (request.connect) {
            console.log("connecting...");
            let { playbackSpeed } = await chrome.storage.sync.get(['playbackSpeed'])

            let url = new URL(sender.tab.url)
            let videoId = url.searchParams.get("id");
            let savedTime = (await chrome.storage.local.get([`${videoId}`]))[`${videoId}`];

            console.log("setting...", savedTime, playbackSpeed)
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id, allFrames: true },
                func: function (time, speed) {
                    videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
                    Array.prototype.forEach.call(videoElements, function (elm) {
                        elm.playbackRate = speed;
                        let playPromise = elm.play()
                        if (playPromise !== undefined) {
                            elm.currentTime = time;
                            // elm.pause()
                        }
                    });
                },
                args: [savedTime || 1, playbackSpeed || 1]
            });
            sendResponse({ connected: true });
        }

        // save time
        if (request.currentTime) {
            let url = new URL(sender.tab.url)
            let videoId = url.searchParams.get("id");
            let values = {};
            values[videoId] = request.currentTime;

            chrome.storage.local.set(values)
            sendResponse({ saved: true });
        }

    }
);