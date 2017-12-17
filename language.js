const en = {
    controls: "Controls:" +
    "<br>" +
    "Left+Right/A+D -> Move left/right" +
    "<br>" +
    "Q/E -> Rotate the tile" +
    "<br>" +
    "Down/S -> Drop the tile faster"
};

const de = {
    controls: "Steuerung:" +
    "<br>" +
    "Links+Rechts/A+D -> Objekt nach links/rechts bewegen" +
    "<br>" +
    "Q/E -> Objekt drehen" +
    "<br>" +
    "Unten/S -> Objekt schneller fallen lassen"
};

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
    const l = new Language(lang);
    document.getElementById("controls").innerHTML = l.getStr("controls");
    switchActiveSelector(lang)
}

function switchActiveSelector(newSelector) {
    const selectors = document.getElementsByClassName("lang");

    for (let i = 0; i < selectors.length; i++) {
        selectors[i].classList.remove("active");
    }

    document.getElementById("lang-" + newSelector).classList.add("active");
}

switchLang("en");

const langSelectors = document.getElementsByClassName("lang");

for (let i = 0; i < langSelectors.length; i++) {
    langSelectors[i].addEventListener('click', () => {
        switchLang(langSelectors[i].getAttribute("data-lang"))
    }, false);
}