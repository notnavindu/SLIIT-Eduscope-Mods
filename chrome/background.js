document.addEventListener("DOMContentLoaded", () => {
  // check if user is in the eduscope website
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let pageUrl = tabs[0].url;
    if (!pageUrl.includes("lecturecapture.sliit.lk")) {
      document.body.classList.add("--eduscope-mod-disabled");
      document.getElementById("eduscope-mod-error").innerHTML = "Only works in lecturecapture.sliit.lk";
    } else {
      // get saved values
      var savedPlaybackSpeed = window.localStorage.getItem("savedPlaybackSpeed");
      var savedScroll = window.localStorage.getItem("savedScroll");
      var savedHeader = window.localStorage.getItem("savedHeader");
      var savedDark = window.localStorage.getItem("savedDark");
      var savedTweaks = window.localStorage.getItem("savedTweaks");

      // set saved options
      if (savedPlaybackSpeed) {
        setPlaybackSpeed(savedPlaybackSpeed);
      }

      if (savedScroll) {
        setScroll(savedScroll);
      }

      if (savedHeader) {
        setHeader(savedHeader);
      }
      if (savedDark) {
        setDark(savedDark);
      }

      if (savedTweaks) {
        setTweaks(savedTweaks);
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

function onHeaderOptionChange() {
  console.log("test");
  //set speed
  setHeader(this.value);
  // save to local storage
  window.localStorage.setItem("savedHeader", this.value);
}

function onDarkOptionChange() {
  setDark(this.value);
  // save to local storage
  window.localStorage.setItem("savedDark", this.value);
}

function onTweaksOptionChange() {
  setTweaks(this.value);

  if (this.value == 0) {
    // request page refresh
    document.getElementById("eduscope-mod-option-scroll-subtitle").innerHTML = "Page Refresh Required";

    // TODO Find a way to remove event handlers with extensions
  } else {
    document.getElementById("eduscope-mod-option-scroll-subtitle").innerHTML = "";
  }

  // save to local storage
  window.localStorage.setItem("savedTweaks", this.value);
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

// show and hide the header
function setHeader(state) {
  if (state == 0) {
    chrome.tabs.executeScript({
      code: ` document.getElementById("navbar").style.display = "block"; `,
    });
  } else {
    chrome.tabs.executeScript({
      code: ` document.getElementById("navbar").style.display = "none"; `,
    });
  }

  document.getElementById(`header-${state}`).checked = true;
}

function setSpeedSubtitle(val) {
  let texts = {
    1: "Noobs",
    1.25: "Kids",
    1.5: "Men",
    1.75: "Legends",
    2: "Ultra Legends",
    6: "Rap God",
  };
  document.getElementById("eduscope-mod-option-subtitle").innerHTML = texts[val];
}

// set dark theme
function setDark(state) {
  if (state == 0) {
    chrome.tabs.executeScript({
      code: `
        document.body.classList.remove("dark-mode");
  
        if(document.querySelector(".boxview")!=null){
          var x=document.querySelectorAll(".boxview");
          for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("dark-mode");
          }
        }
  
        var l = document.getElementsByTagName('label');
        for (var i = 0; i < l.length; i++) {
          l[i].classList.remove("dark-mode");
        }

        var hr = document.getElementsByTagName('hr');
        for (var i = 0; i < hr.length; i++) {
          hr[i].style.borderTop = "1px solid #eee";
        }
  
        if(document.querySelector(".main-div")!=null){
          document.querySelector(".main-div").classList.remove("dark-mode");
        }

        document.getElementById("comment").classList.remove("dark-textarea");
        document.getElementById("comment").classList.add("form-control");
      `,
    });
  } else {
    chrome.tabs.executeScript({
      code: `
        document.body.classList.add("dark-mode");
  
        if(document.querySelector(".boxview")!=null){
          var x=document.querySelectorAll(".boxview");
          for (var i = 0; i < x.length; i++) {
            x[i].classList.add("dark-mode");
          }
        }

        var l = document.getElementsByTagName('label');
        for (var i = 0; i < l.length; i++) {
          l[i].classList.add("dark-mode");
        }

        var hr = document.getElementsByTagName('hr');
        for (var i = 0; i < hr.length; i++) {
          hr[i].style.borderTop = "1px solid #0388fc";
        }
  
        if(document.querySelector(".main-div")!=null){
          document.querySelector(".main-div").classList.add("dark-mode");
        }

        document.getElementById("comment").classList.add("dark-textarea");
        document.getElementById("comment").style.width="100%";
        document.getElementById("comment").style.padding="10px";
        document.getElementById("comment").style.height="100px";
        document.getElementById("comment").classList.remove("form-control");
      `,
    });
  }

  document.getElementById(`dark-${state}`).checked = true;
}

// set UI Tweaks
function setTweaks(state) {
  if (state == 0) {
    console.log("off");
  } else {
    // the eplayer is inside an iframe. access it accordingly
    chrome.tabs.executeScript({
      code: `
      document.getElementsByTagName("body")[0].style.fontFamily = "Arial"; 

      controlBar = document.getElementById("eplayer_iframe").contentWindow.document.querySelector(".video-react-control-bar-auto-hide");
      controlBar.style.height = "45px";
      controlBar.style.fontSize = "1.4em";
      controlBar.style.marginBottom = "15px";
      controlBar.style.backgroundColor = "#121212";
      controlBar.style.opacity = "0.9";
      controlBar.style.borderRadius = "7px";
      controlBar.style.border = "1px solid #0388fc";
      
      // comment button
      document.getElementById("comment_submit").style.borderRadius = "7px";
      document.getElementById("comment_submit").style.marginTop = "15px";
      document.getElementById("comment_submit").style.backgroundColor = "#121212";
      document.getElementById("comment_submit").style.border = "2px solid #0388fc";

      // video frame
      document.getElementById("eplayer_iframe").style.border = "2px solid #002647";
      document.getElementById("eplayer_iframe").contentWindow.document.documentElement.style.backgroundColor = "#121212";

      `,
    });
  }

  document.getElementById(`tweaks-${state}`).checked = true;
}
