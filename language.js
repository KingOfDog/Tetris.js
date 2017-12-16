const en = {
    controls: "Controls:" +
    "<br>" +
    "Left+Right/A+D -> Move left/right or down\n" +
    "<br>" +
    "Q/E -> Rotate the tile" +
    "<br>" +
    "Down/S -> Drop the tile faster"
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
}

switchLang("en");