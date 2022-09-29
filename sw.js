let studentId;
let saveLoop;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        init(tab)
    }
});

chrome.tabs.onRemoved.addListener(
    async (tabId) => {
        let videoId = (await chrome.storage.local.get(`edugraph-${tabId}-videoId`))[`edugraph-${tabId}-videoId`]
        await saveSession(tabId, videoId)

        try {
            await chrome.storage.local.remove([[
                `edugraph-${videoId}-session-start`,
                `edugraph-${videoId}-duration`,
                `edugraph-${videoId}-isPlaying`,
                `edugraph-studentId`
            ]])
        } catch (error) {

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
    console.log("init edugraph")

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
            sendResponse({ connected: true });

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


        }

        // save time
        if (request.currentTime) {
            sendResponse({ saved: request.currentTime });
            let values = {};
            values[videoId] = request.currentTime;

            chrome.storage.local.set(values)
        }

        // eduGraph
        if (request.studentId) {
            sendResponse({ recieved: true })
            studentId = request.studentId;
            resetLocalData(videoId, studentId, sender.tab.id)
        }

        if (request.pause) {
            sendResponse({ recieved: true });
            console.log("Pause")

            let data = await chrome.storage.local.get([`edugraph-${videoId}-session-start`, `edugraph-${videoId}-duration`])

            let now = Date.now();
            let diff = now - data[`edugraph-${videoId}-session-start`];

            let playingVal = {}
            playingVal[`edugraph-${videoId}-duration`] = data[`edugraph-${videoId}-duration`] + diff;
            playingVal[`edugraph-${videoId}-isPlaying`] = false;
            playingVal[`edugraph-${videoId}-session-start`] = now;

            await chrome.storage.local.set(playingVal)
        }

        if (request.play) {
            sendResponse({ recieved: true });

            console.log("play");

            let playingVal = {}
            playingVal[`edugraph-${videoId}-isPlaying`] = true;
            playingVal[`edugraph-${videoId}-session-start`] = Date.now()
            await chrome.storage.local.set(playingVal)
        }

        if (request.autoSave) {
            sendResponse({ recieved: true });
            saveSession(sender.tab.id, videoId)
        }

        return true;
    }
);


const test = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 500)
    })
}

const resetLocalData = async (videoId, studentId, tabId) => {
    let values = {};
    values[`edugraph-${videoId}-duration`] = 0;
    values[`edugraph-${videoId}-session-start`] = Date.now();
    values[`edugraph-${videoId}-isPlaying`] = false;
    values[`edugraph-${tabId}-videoId`] = videoId;
    values[`edugraph-studentId`] = studentId;
    await chrome.storage.local.set(values)
}

const getEdugraphValuesForVideo = async (videoId) => {
    let data = await chrome.storage.local.get([
        `edugraph-${videoId}-session-start`,
        `edugraph-${videoId}-duration`,
        `edugraph-${videoId}-isPlaying`,
        `edugraph-studentId`
    ])

    return {
        sessionStart: data[`edugraph-${videoId}-session-start`],
        duration: data[`edugraph-${videoId}-duration`],
        isPlaying: data[`edugraph-${videoId}-isPlaying`],
        studentId: data["edugraph-studentId"]
    }
}

const saveSession = async (tabId, videoId) => {
    return new Promise(async (resolve, reject) => {
        console.log("...")
        let { sessionStart, duration, isPlaying, studentId } = await getEdugraphValuesForVideo(videoId)

        if (isPlaying) {
            duration = duration + (Date.now() - sessionStart)
        }

        let data = {
            studentId: studentId,
            start: sessionStart,
            duration: duration,
            videoId: videoId
        }

        let val = {}
        val[`edugraph-${videoId}-duration`] = 0;
        val[`edugraph-${videoId}-session-start`] = Date.now();

        await chrome.storage.local.set(val)

        if (studentId && duration > 1) {
            console.log(data.duration)
            // send to API
            fetch("https://edu-graph.vercel.app/api/save", {
                method: "POST",
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(data)
            }).then(res => {
                console.log("Request complete! response:", res);
                resolve()
            }).catch(e => {
                reject()
            });
        }
    })

}

