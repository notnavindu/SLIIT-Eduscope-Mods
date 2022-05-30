document.body.classList.add("dark-mode");

if (document.querySelector(".boxview") != null) {
    var x = document.querySelectorAll(".boxview");
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

if (document.querySelector(".main-div") != null) {
    document.querySelector(".main-div").classList.add("dark-mode");
}

if (document.getElementById("comment")) {
    document.getElementById("comment").classList.add("dark-textarea");
    document.getElementById("comment").style.width = "100%";
    document.getElementById("comment").style.padding = "10px";
    document.getElementById("comment").style.height = "100px";
    document.getElementById("comment").classList.remove("form-control");
}
