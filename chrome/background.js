document.addEventListener("DOMContentLoaded", function () {
  console.log("will this work")
  setupUI()
});


// check if user is in the eduscope website
async function setupUI() {
  let tabs = await chrome.tabs.query({ active: true });

  let pageUrl = tabs[0].url;

  if (!pageUrl.includes("lecturecapture.sliit.lk")) {
    document.body.classList.add("--eduscope-mod-disabled");
    document.getElementById("eduscope-mod-error").innerHTML = "Only works in lecturecapture.sliit.lk";
  } else {
    // get saved values
    let { playbackSpeed } = await chrome.storage.sync.get(['playbackSpeed']);
    let { scroll } = await chrome.storage.sync.get(["scroll"]);
    let { header } = await chrome.storage.sync.get(["header"]);
    let { dark } = await chrome.storage.sync.get(["dark"]);
    let { tweaks } = await chrome.storage.sync.get(["tweaks"]);

    // set saved options
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


    // get input elements
    let speedOptions = document.getElementsByName("speed");
    let scrollOptions = document.getElementsByName("scroll");
    let headerOptions = document.getElementsByName("header");
    let darkOptions = document.getElementsByName("dark");
    let tweaksOptions = document.getElementsByName("tweaks");

    //add onclick handlers
    //speed
    Array.prototype.forEach.call(speedOptions, function (radio) {
      radio.addEventListener("change", onSpeedOptionChange);
    });

    //scroll
    Array.prototype.forEach.call(scrollOptions, function (radio) {
      radio.addEventListener("change", onScrollOptionChange);
    });

    //header
    Array.prototype.forEach.call(headerOptions, function (radio) {
      radio.addEventListener("change", onHeaderOptionChange);
    });

    //DarkMode
    Array.prototype.forEach.call(darkOptions, function (radio) {
      radio.addEventListener("change", onDarkOptionChange);
    });

    //UI Tweaks
    Array.prototype.forEach.call(tweaksOptions, function (radio) {
      radio.addEventListener("change", onTweaksOptionChange);
    });

  }
}



// change video playback speed change handler
async function onSpeedOptionChange() {
  //set speed
  setPlaybackSpeed(this.value);
  // save to storage
  await chrome.storage.sync.set({ "playbackSpeed": this.value })
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

async function onHeaderOptionChange() {
  //set speed
  setHeader(this.value);
  // save to local storage
  await chrome.storage.sync.set({ "header": this.value })
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


/*
*
* ------------------------------ 
* | Injectors
* ------------------------------
*
*/


// set playback speed
async function setPlaybackSpeed(speed) {
  setSpeedSubtitle(speed);

  let tabs = await chrome.tabs.query({ active: true });

  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id, allFrames: true },
    func: function (speed) {
      videoElements = document.getElementById("eplayer_iframe")?.contentWindow?.document?.getElementsByTagName("video") || [];
      Array.prototype.forEach.call(videoElements, function (elm) {
        elm.playbackRate = speed;
      });
    },
    args: [speed]
  });

  // set 'checked' state.
  document.getElementById(`${speed}xSpeed`).checked = true;
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

  document.getElementById(`scroll-${state}`).checked = true;
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

  document.getElementById(`header-${state}`).checked = true;
}

async function setSpeedSubtitle(val) {
  let texts = {
    1: "Noobs",
    1.25: "Kids",
    1.5: "Men",
    1.75: "Legends",
    2: "Ultra Legends",
    2.5: "Ultra Legend Pro",
    3: "Ultra Legend Pro Max",
    6: "Rap God",
    16: "Yeah, Life is short",
  };

  document.getElementById("eduscope-mod-option-subtitle").innerHTML = texts[val];
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

  document.getElementById(`dark-${state}`).checked = true;
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

  document.getElementById(`tweaks-${state}`).checked = true;
}
