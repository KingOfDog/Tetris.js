const en = {
    btnPlay: "Play!",
    btnReset: "Reset",
    btnResume: "Resume",
    controlsDown: "Accelerate falling",
    controlsHold: "Hold",
    controlsLeft: "Move left",
    controlsPause: "Pause",
    controlsRight: "Move right",
    controlsTLeft: "Rotate to the left",
    controlsTRight: "Rotate to the right",
    counterScore: "Score: ",
    counterTime: "Time: ",
    themeDefault: "Default",
    themeClean: "Clean",
    themeModern: "Modern",
    themeRetro: "Retro",
    themeSnakes: "Snakes",
    titleAppearance: "Appearance",
    titleControls: "Controls",
    titleGame: "Tetris.js",
    titleLanguage: "Language",
    titlePaused: "Paused"
};

const de = {
    btnPlay: "Spielen!",
    btnReset: "Zurücksetzen",
    btnResume: "Weiterspielen",
    controlsDown: "Fallen beschleunigen",
    controlsHold: "Halten",
    controlsLeft: "Nach links bewegen",
    controlsPause: "Pausieren",
    controlsRight: "Nach rechts bewegen",
    controlsTLeft: "Nach links drehen",
    controlsTRight: "Nach rechts drehen",
    counterScore: "Punkte: ",
    counterTime: "Zeit: ",
    themeDefault: "Standard",
    themeClean: "Lückenlos",
    themeModern: "Futuristisch",
    themeRetro: "Retro",
    themeSnakes: "Schlangen",
    titleAppearance: "Aussehen",
    titleControls: "Steuerung",
    titleLanguage: "Sprache",
    titlePaused: "Pausiert"
};

let currentLang = ["de", "en"].includes(navigator.language || navigator.userLanguage) ? navigator.language || navigator.userLanguage : "en";
let firstRun = true;

class Language {

    constructor(lang) {
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const obj = JSON.parse(this.responseText);
                console.log(JSON.stringify(obj));
            }
        };

        xmlhttp.open("GET", "/lang.json", true);
        xmlhttp.send();

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

    const elements = document.querySelectorAll('[data-string]');
    for (let i = 0; i < elements.length; i++) {
        let el = elements[i];
        let str = l.getStr(el.getAttribute("data-string"));
        if (el.getAttribute("data-string-first-run") != null && firstRun) {
            str = l.getStr(el.getAttribute("data-string-first-run"));
        }
        if (el.getAttribute("data-string-type")) {
            switch (el.getAttribute("data-string-type")) {
                case "prefix":
                    el.setAttribute("data-prefix", str);
                    break;
                default:
                    el.innerHTML = str;
                    break;
            }
        } else {
            el.innerHTML = str;
        }
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