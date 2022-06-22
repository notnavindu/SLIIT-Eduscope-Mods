
document.body.classList.remove("dark-mode");

if (document.querySelector(".boxview") != null) {
    var x = document.querySelectorAll(".boxview");
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

if (document.querySelector(".main-div") != null) {
    document.querySelector(".main-div").classList.remove("dark-mode");
}

if (document.getElementById("comment")) {
    document.getElementById("comment").classList.remove("dark-textarea");
    document.getElementById("comment").classList.add("form-control");
}
