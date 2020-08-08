document.addEventListener("DOMContentLoaded", () => {
  // check if user is in the eduscope website
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let pageUrl = tabs[0].url;
    if (!pageUrl.includes("lecturecapture.sliit.lk")) {
      document.body.classList.add("--eduscope-mod-disabled");
      document.getElementById("eduscope-mod-error").innerHTML = "Only works in lecturecapture.sliit.lk";
    } else {
      // set saved values
      var savedPlaybackSpeed = window.localStorage.getItem("savedPlaybackSpeed");
      var savedScroll = window.localStorage.getItem("savedScroll");

      // set saved options
      if (savedPlaybackSpeed) {
        setPlaybackSpeed(savedPlaybackSpeed);
      }

      if (savedScroll) {
        setScroll(savedScroll);
      }

      // get input elements
      let speedOptions = document.getElementsByName("speed");
      let scrollOptions = document.getElementsByName("scroll");

      //add onclick handlers
      //speed
      Array.prototype.forEach.call(speedOptions, function (radio) {
        radio.addEventListener("change", onSpeedOptionChange);
      });

      //scroll
      Array.prototype.forEach.call(scrollOptions, function (radio) {
        radio.addEventListener("change", onScrollOptionChange);
      });
    }
  });
});

// change video playback speed change handler
function onSpeedOptionChange() {
  //set speed
  setPlaybackSpeed(this.value);
  // save to local storage
  window.localStorage.setItem("savedPlaybackSpeed", this.value);
}

// change scroll behavior change handler
function onScrollOptionChange() {
  //set speed
  setScroll(this.value);
  if (this.value == 0) {
    // request page refresh
    document.getElementById("eduscope-mod-option-scroll-subtitle").innerHTML = "Page Refresh Required";

    // TODO Find a way to remove event handlers with extensions
  } else {
    document.getElementById("eduscope-mod-option-scroll-subtitle").innerHTML = "";
  }

  // save to local storage
  window.localStorage.setItem("savedScroll", this.value);
}

// set playback speed
function setPlaybackSpeed(speed) {
  setSpeedSubtitle(speed);
  //set speed
  chrome.tabs.executeScript({
    code: ` videoElements = document.getElementsByTagName("video");
            Array.prototype.forEach.call(videoElements, function (elm) {
                elm.playbackRate = ${speed};
            });`,
  });
  // set 'checked' state. lil hack
  document.getElementById(`${speed}xSpeed`).checked = true;
}

// set scrolling behaviour
function setScroll(state) {
  if (state == 1) {
    //set handler
    chrome.tabs.executeScript({
      code: ` window.addEventListener('keydown', function(e) {
                if(e.keyCode == 32 ) {
                    e.preventDefault();
                }
            });`,
    });
  }

  document.getElementById(`scroll-${state}`).checked = true;
}

function setSpeedSubtitle(val) {
  let texts = {
    0.5: "Kids",
    1: "Men",
    2: "Legends",
    6: "Rap God",
  };
  document.getElementById("eduscope-mod-option-subtitle").innerHTML = texts[val];
}
