const en = {
    controls: "Controls:" +
    "<br>" +
    "Left+Right/A+D -> Move left/right" +
    "<br>" +
    "Q/E -> Rotate the tile" +
    "<br>" +
    "Down/S -> Drop the tile faster" +
    "<br>" +
    "Space/Esc -> Pause the game",
    play: "Play!",
    score: "Score: ",
    paused: "Paused",
    resume: "Resume",
    title: "Tetris.js",
    reset: "Reset"
};

const de = {
    controls: "Steuerung:" +
    "<br>" +
    "Links+Rechts/A+D -> Objekt nach links/rechts bewegen" +
    "<br>" +
    "Q/E -> Objekt drehen" +
    "<br>" +
    "Unten/S -> Objekt schneller fallen lassen" +
    "<br>" +
    "Leertaste/Esc -> Pausiere das Spiel",
    play: "Spielen!",
    score: "Punkte: ",
    paused: "Pausiert",
    resume: "Weiterspielen",
    reset: "Zurücksetzen"
};

let currentLang = ["de", "en"].includes(navigator.language || navigator.userLanguage) ? navigator.language || navigator.userLanguage : "en";
let firstRun = true;

class Language {

    constructor(lang) {
        this.lang = lang;
        if(eval('typeof ' + this.lang) === 'undefined')
            this.lang = "en";
    }

    getStr(str, defaultStr) {
        const retStr = eval('eval(this.lang).' + str);
        if(typeof retStr !== 'undefined')
            return retStr;
        if(typeof defaultStr !== 'undefined')
            return defaultStr;
        return eval('en.' + str);
    }
}

function switchLang(lang) {
    currentLang = lang;
    const l = new Language(currentLang);
    document.getElementById("score").setAttribute("data-prefix", l.getStr("score"));
    document.getElementById("controls").innerHTML = l.getStr("controls");
    if(firstRun) {
        document.getElementById("game-title").innerHTML = l.getStr("title");
        document.getElementById("game-play").innerHTML = l.getStr("play");
    } else {
        document.getElementById("game-title").innerHTML = l.getStr("paused");
        document.getElementById("game-play").innerHTML = l.getStr("resume");
        document.getElementById("game-reset").innerHTML = l.getStr("reset");
    }
    switchActiveSelector(currentLang)
}

function switchActiveSelector(newSelector) {
    const selectors = document.getElementsByClassName("lang");

    for (let i = 0; i < selectors.length; i++) {
        selectors[i].classList.remove("active");
    }

    document.getElementById("lang-" + newSelector).classList.add("active");
}

switchLang(currentLang);

const langSelectors = document.getElementsByClassName("lang");

for (let i = 0; i < langSelectors.length; i++) {
    langSelectors[i].addEventListener('click', () => {
        switchLang(langSelectors[i].getAttribute("data-lang"))
    }, false);
}