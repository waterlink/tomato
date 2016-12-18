function Tomato(workTime, breakTime) {
    var seconds = 0;
    var totalSeconds = workTime;
    var started = false;
    var isBreak = false;

    this.update = function (passed, cb) {
        if (!started) return;
        if (seconds >= totalSeconds - 1) {
            toggleWorkBreak();
            cb(isBreak);
            return;
        }
        seconds += passed;
    };

    this.toggle = function () {
        started = !started;
        seconds = 0;
    };

    this.progress = function () {
        return seconds / totalSeconds;
    };

    this.minutes = function () {
        return Math.max(0, Math.floor(secondsLeft() / 60));
    };

    this.seconds = function () {
        return Math.max(0, secondsLeft() % 60);
    };

    this.isBreak = function () {
        return isBreak;
    };

    function secondsLeft() {
        return Math.floor(totalSeconds - seconds);
    }

    function toggleWorkBreak() {
        isBreak = !isBreak;
        started = false;
        seconds = 0;

        if (isBreak) totalSeconds = breakTime;
        else totalSeconds = workTime;
    }
}

function Settings() {
    var defaultWorkTime = 25;
    var defaultBreakTime = 5;

    this.createTomatoFromSettings = function () {
        return new Tomato(this.workTime() * 60, this.breakTime() * 60);
    };

    this.storeWorkTime = function (value) {
        localStorage.setItem("Tomato.workTime", value);
    };

    this.storeBreakTime = function (value) {
        localStorage.setItem("Tomato.breakTime", value);
    };

    this.workTime = function () {
        return parseInt(localStorage.getItem("Tomato.workTime")) || defaultWorkTime;
    };

    this.breakTime = function () {
        return parseInt(localStorage.getItem("Tomato.breakTime")) || defaultBreakTime;
    };
}

var settings = new Settings();
var tomato = settings.createTomatoFromSettings();
var tomatoContainer = document.getElementById("tomatoContainer");
var tomatoCircle = document.getElementById("tomatoCircle");
var timeContainer = document.getElementById("timeContainer");
var settingsButton = document.getElementById("settingsButton");
var mainView = document.getElementById("mainView");
var settingsView = document.getElementById("settingsView");
var workTimeSelect = document.getElementById("workTimeSelect");
var breakTimeSelect = document.getElementById("breakTimeSelect");
var total = 252;
var now = new Date();

selectOption(workTimeSelect, settings.workTime());
selectOption(breakTimeSelect, settings.breakTime());

function setProgress(progress) {
    tomatoCircle.style.strokeDasharray = "0 " + progress + " " + total;
}

function setTime(minutes, seconds) {
    timeContainer.textContent = padWithZero(minutes) + ":" + padWithZero(seconds);
}

function padWithZero(number) {
    if (number < 10) return "0" + number;
    return "" + number;
}

function setBreakStyle(className) {
    tomatoCircle.setAttribute("class", className);
}

function update() {
    var nextTime = new Date();
    var secondsPassed = (nextTime.getTime() - now.getTime()) / 1000;
    now = nextTime;

    tomato.update(secondsPassed, function (breakTime) {
        alert("It is " + (breakTime ? "break" : "work") + " time!");
    });

    setProgress(tomato.progress() * total);
    setTime(tomato.minutes(), tomato.seconds());
    setBreakStyle(tomato.isBreak() ? "break-time" : "work-time");
}

function selectOption(select, value) {
    var options = select.options;
    for (var opt, j = 0; opt = options[j]; j++) {
        if (opt.value == value) {
            select.selectedIndex = j;
            break;
        }
    }
}

tomatoContainer.onclick = function () {
    tomato.toggle();
    update();
};

settingsButton.onclick = function () {
    if (settingsView.classList.contains("hidden")) {
        mainView.classList.add("hidden");
        settingsView.classList.remove("hidden");
    } else {
        mainView.classList.remove("hidden");
        settingsView.classList.add("hidden");
    }
};

workTimeSelect.onchange = function (event) {
    settings.storeWorkTime(event.target.value);
    tomato = settings.createTomatoFromSettings();
};

breakTimeSelect.onchange = function (event) {
    settings.storeBreakTime(event.target.value);
    tomato = settings.createTomatoFromSettings();
};

setInterval(update, 1000);
update();

setTimeout(function () {
    navigator.vibrate(10000);
}, 3000);
