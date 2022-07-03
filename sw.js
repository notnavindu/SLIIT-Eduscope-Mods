let globalSession = {};
let sessionStart = {};
let studentId;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        init(tab)
    }

    if (changeInfo.status === "loading" && tab.url.includes("lecturecapture.sliit.lk")) {
        if (globalSession[tabId]) {
            saveSession(tabId)
        }
    }
});

chrome.tabs.onRemoved.addListener(
    (tabId) => {
        if (globalSession[tabId]) {
            saveSession(tabId);
        }
    }
)


async function init(tab) {
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

        setAnalytics(tab.id, tab.url)
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

// Analytics
async function setAnalytics(tabId) {
    globalSession[tabId] = {};
    globalSession[tabId] = {
        start: null,
        duration: 0,
        isPlaying: false
    };

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['./scripts/eduGraph.js'],
    });
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
        let url = new URL(sender.tab.url)
        let videoId = url.searchParams.get("id");

        // initial request
        if (request.connect) {
            let { playbackSpeed } = await chrome.storage.sync.get(['playbackSpeed'])

            let savedTime = (await chrome.storage.local.get([`${videoId}`]))[`${videoId}`];

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
            let values = {};
            values[videoId] = request.currentTime;

            chrome.storage.local.set(values)
            sendResponse({ saved: true });
        }

        // eduGraph
        if (request.studentId) {
            studentId = request.studentId;
            sendResponse({ recieved: true })
        }

        if (request.pause) {
            console.log("Pause")

            globalSession[sender.tab.id].isPlaying = false;

            let now = Date.now();
            let diff = now - sessionStart[sender.tab.id];

            globalSession[sender.tab.id].duration += diff;

            sendResponse({ recieved: true });
        }

        if (request.play) {
            sessionStart[sender.tab.id] = Date.now();
            globalSession[sender.tab.id].isPlaying = true;

            if (globalSession[sender.tab.id].start == null) {
                globalSession[sender.tab.id].start = sessionStart[sender.tab.id]
                globalSession[sender.tab.id].videoId = videoId
            }

            sendResponse({ recieved: true });
        }
    }
);


const saveSession = (tabId) => {
    if (globalSession[tabId]?.isPlaying) {
        let now = Date.now();
        let diff = now - sessionStart[tabId];

        globalSession[tabId].duration += diff;
    }

    console.log("Ended -> ", globalSession[tabId].videoId, globalSession[tabId].duration);

    let data = {
        studentId: studentId,
        ...globalSession[tabId]
    }

    if (studentId && globalSession[tabId].duration > 1) {
        // send to API
        fetch("http://localhost:3000/api/save", {
            method: "POST",
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
            body: JSON.stringify(data)
        }).then(res => {
            console.log("Request complete! response:", res);
        });

        delete globalSession[tabId]
    }
}

