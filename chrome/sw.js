chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        init()
    }
});

async function init() {
    let tabs = await chrome.tabs.query({ active: true });

    if (tabs[0].url.includes("lecturecapture.sliit.lk")) {
        // get saved values
        let { scroll } = await chrome.storage.sync.get(["scroll"]);
        let { dark } = await chrome.storage.sync.get(["dark"]);
        let { tweaks } = await chrome.storage.sync.get(["tweaks"]);
        let { theater } = await chrome.storage.sync.get(["theater"]);

        if (scroll) {
            setScroll(scroll);
        }

        if (dark) {
            setDark(dark);
        }

        if (tweaks) {
            setTweaks(tweaks);
        }

        if (theater) {
            setTheaterMode(theater);
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

// set Theater mode
async function setTheaterMode(state) {
    let tabs = await chrome.tabs.query({ active: true });

    if (state == 0) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            files: ['./scripts/theaterRemove.js'],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
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

chrome.runtime.onConnect.addListener(async (port) => {
    // get saved time and playback speed
    let { playbackSpeed } = await chrome.storage.sync.get(['playbackSpeed'])

    let url = new URL(port.sender.url)
    let videoId = url.searchParams.get("id");
    let savedTime = (await chrome.storage.local.get([`${videoId}`]))[`${videoId}`];

    console.log("setting...", savedTime, playbackSpeed)
    chrome.scripting.executeScript({
        target: { tabId: port.sender.tab.id, allFrames: true },
        func: function (time, speed) {
            videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
            Array.prototype.forEach.call(videoElements, function (elm) {
                let playPromise = elm.play()
                if (playPromise !== undefined) {
                    elm.currentTime = time;
                    elm.playbackRate = speed;
                    // elm.pause()
                }
            });
        },
        args: [savedTime || 1, playbackSpeed || 1]
    });


    port.onMessage.addListener(async (msg) => {
        if (msg.currentTime) {
            let url = new URL(port.sender.url)
            let videoId = url.searchParams.get("id");
            let values = {};
            values[videoId] = msg.currentTime;

            await chrome.storage.local.set(values)
        }
    });
});