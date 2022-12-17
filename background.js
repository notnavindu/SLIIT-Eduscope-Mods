document.addEventListener("DOMContentLoaded", function () {
  setupUI()
});


// check if user is in the eduscope website
async function setupUI() {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  let pageUrl = tabs[0].url;

  console.log(pageUrl)

  if (!pageUrl.includes("lecturecapture.sliit.lk")) {
    document.body.classList.add("--eduscope-mod-disabled");
    document.getElementById("eduscope-mod-error").innerHTML = "Only works in lecturecapture.sliit.lk";
  } else {
    // get saved values
    let { playbackSpeed } = await chrome.storage.sync.get(['playbackSpeed']);
    let { scroll } = await chrome.storage.sync.get(["scroll"]);
    let { dark } = await chrome.storage.sync.get(["dark"]);
    let { tweaks } = await chrome.storage.sync.get(["tweaks"]);
    let { theater } = await chrome.storage.sync.get(["theater"]);
    let { analytics } = await chrome.storage.sync.get(["analytics"]);

    // set saved options
    if (playbackSpeed) {
      setPlaybackSpeed(playbackSpeed, true);
    }

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

    if (analytics) {
      setAnalyticsOption(analytics)
    }


    // get input elements
    let speedSlider = document.getElementById("speedSlider");
    let speedOptions = document.getElementsByName("speed");
    let scrollOptions = document.getElementsByName("scroll");
    let darkOptions = document.getElementsByName("dark");
    let tweaksOptions = document.getElementsByName("tweaks");
    let theaterOptions = document.getElementsByName("theater");
    let analyticsOptions = document.getElementsByName("analytics");
    let pipMode = document.getElementById("pip");
    let downloadBtn = document.getElementById("download");

    //add onclick handlers
    //speed
    speedSlider.oninput = onSpeedOptionChangeRealtime
    speedSlider.onmouseup = onSpeedOptionChange

    //speed buttons
    Array.prototype.forEach.call(speedOptions, function (radio) {
      radio.addEventListener("change", onButtonSpeedOptionChange);
    });

    //scroll
    Array.prototype.forEach.call(scrollOptions, function (radio) {
      radio.addEventListener("change", onScrollOptionChange);
    });

    //DarkMode
    Array.prototype.forEach.call(darkOptions, function (radio) {
      radio.addEventListener("change", onDarkOptionChange);
    });

    //UI Tweaks
    Array.prototype.forEach.call(tweaksOptions, function (radio) {
      radio.addEventListener("change", onTweaksOptionChange);
    });

    // Theater mode
    Array.prototype.forEach.call(theaterOptions, function (radio) {
      radio.addEventListener("change", onTheaterOptionChange);
    });

    // Analytics consent
    Array.prototype.forEach.call(analyticsOptions, function (radio) {
      radio.addEventListener("change", onAnalyticsOptionChange);
    });

    // PIP mode
    pipMode.addEventListener("click", enablePip);

    // download button
    downloadBtn.addEventListener("click", () => downloadVideo(pageUrl));

  }
}

/*
*  --------------------------
* | Option Change Handlers  |
* --------------------------
*
*/


// change video playback speed change handler
async function onSpeedOptionChange() {
  //set speed
  setPlaybackSpeed(this.value);
  // save to storage
  await chrome.storage.sync.set({ "playbackSpeed": this.value })
}

async function onButtonSpeedOptionChange() {
  //set speed
  setPlaybackSpeed(this.value);
  //
  document.getElementById("speedSlider").value = this.value
  onSpeedOptionChangeRealtime(this.value)
  // save to storage
  await chrome.storage.sync.set({ "playbackSpeed": this.value })
}

async function onSpeedOptionChangeRealtime(customValue = 0) {
  let val = this.value || customValue
  let suffix = val > 5 ? "x🔥" : "x"
  document.getElementById("speedValue").innerHTML = `${Number(val).toFixed(2)}${suffix}`
  document.getElementById("blinker").style.animationDuration = `${Number((1 / val) / 2).toFixed(2)}s`

  let speedOptions = document.getElementsByName("speed")

  speedOptions.forEach(elm => {
    elm.checked = false
  })

  // const btn = buttons[`${Number(val).toFixed(2)}`]
  // if (btn) {
  //   document.getElementById(btn).checked = true
  // }
}

// change scroll behavior change handler
async function onScrollOptionChange() {
  //set speed
  setScroll(this.value);
  if (this.value == 0) {
    // request page refresh
    document.getElementById("eduscope-mod-option-scroll-subtitle").innerHTML = "Page Refresh Required";

    // TODO Find a way to remove event handlers with extensions
  } else {
    document.getElementById("eduscope-mod-option-scroll-subtitle").innerHTML = "";
  }

  // save to storage
  await chrome.storage.sync.set({ "scroll": this.value })
}

async function onDarkOptionChange() {
  setDark(this.value);
  // save to local storage
  await chrome.storage.sync.set({ "dark": this.value })
}

async function onTweaksOptionChange() {
  setTweaks(this.value);

  if (this.value == 0) {
    // request page refresh
    document.getElementById("eduscope-mod-option-tweaks-subtitle").innerHTML = "Page Refresh Required";

    // TODO Find a way to remove event handlers with extensions
  } else {
    document.getElementById("eduscope-mod-option-tweaks-subtitle").innerHTML = "";
  }

  // save to local storage
  await chrome.storage.sync.set({ "tweaks": this.value })
}

async function onTheaterOptionChange() {
  setTheaterMode(this.value);

  // save to local storage
  await chrome.storage.sync.set({ "theater": this.value })
}

async function onAnalyticsOptionChange() {
  console.log(this.value)
  // save to local storage
  await chrome.storage.local.set({ "analytics": this.value })
}


async function downloadVideo(url) {
  let port = await chrome.runtime.connectNative("com.navindu.eduscope");

  message = { "link": url };
  port.postMessage(message);

  port.onDisconnect.addListener(function () {
    if (chrome.runtime.lastError.message === "Specified native messaging host not found.") {
      window.open("https://github.com/notnavindu/SLIIT-Eduscope-Video-Downloader/blob/main/ONBOARDING.md", "_blank")
    }
  });
}

/*
*
* ------------------------------ 
* | Injectors
* ------------------------------
*
*/

// set playback speed
async function setPlaybackSpeed(speed, setInitial = false) {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id, allFrames: true },
    func: function (sp) {
      videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
      Array.prototype.forEach.call(videoElements, function (elm) {
        // let playPromise = elm.play()
        // if (playPromise !== undefined) {
        //   elm.playbackRate = sp;
        // }
        elm.playbackRate = sp;
      });
    },
    args: [speed]
  });

  if (setInitial) {
    let suffix = this.value > 5 ? "x🔥" : "x"
    document.getElementById("speedValue").innerHTML = `${Number(speed).toFixed(2)}${suffix}`
    document.getElementById("speedSlider").value = speed
  }
}

// set scrolling behaviour
async function setScroll(state) {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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

  document.getElementById(`scroll-${state}`).checked = true;
}

// set dark theme
async function setDark(state) {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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

  document.getElementById(`dark-${state}`).checked = true;
}

// set UI Tweaks
async function setTweaks(state) {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (state == 0) {
    console.log("off");
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      files: ['./scripts/tweaksSet.js'],
    });
  }

  document.getElementById(`tweaks-${state}`).checked = true;
}

// set Theater mode
async function setTheaterMode(state) {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (state == 0) {
    console.log("on")
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      files: ['./scripts/theaterRemove.js'],
    });
  } else {
    console.log("on")
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      files: ['./scripts/theaterSet.js'],
    });
  }

  document.getElementById(`theater-${state}`).checked = true;
}

async function enablePip() {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id, allFrames: true },
    func: function () {
      videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
      Array.prototype.forEach.call(videoElements, function (elm) {
        if (!document.pictureInPictureElement && document.pictureInPictureEnabled) {
          elm.requestPictureInPicture();
        } else {
          console.log("PIP not supported or already in PIP");
        }
      });
    },
  });
}

async function setAnalyticsOption(analytics) {
  document.getElementById(`analytics-${analytics}`).checked = true;
}