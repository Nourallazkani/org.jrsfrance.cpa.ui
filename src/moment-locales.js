export class FrLocale {

    months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    monthsShort = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    weekdaysShort = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    weekdaysMin = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
    longDateFormat = {
        "LT": "HH:mm",
        "LTS": "HH:mm:ss",
        "L": "DD/MM/YYYY",
        "LL": "D MMMM YYYY",
        "LLL": "D MMMM YYYY LT",
        "LLLL": "dddd D MMMM YYYY LT"
    };
    calendar = {
        "sameDay": "[Aujourd'hui à] LT",
        "nextDay": '[Demain à] LT',
        "nextWeek": 'dddd [à] LT',
        "lastDay": '[Hier à] LT',
        "lastWeek": 'dddd [dernier à] LT',
        "sameElse": 'L'
    };
    relativeTime = {
        "future": "dans %s",
        "past": "il y a %s",
        "s": "quelques secondes",
        "m": "une minute",
        "mm": "%d minutes",
        "h": "une heure",
        "hh": "%d heures",
        "d": "un jour",
        "dd": "%d jours",
        "M": "un mois",
        "MM": "%d mois",
        "y": "une année",
        "yy": "%d années"
    };
    ordinalParse = "/\d{1,2}(er|ème)/";
    ordinal(number) {
        return number + (number === 1 ? 'er' : 'ème');
    };
    meridiemParse: "/PD|MD/";
    isPM(input) {
        return input.charAt(0) === "M";
    };
    // in case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example)
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */
    // },
    meridiem(hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    };
    week = {
        "dow": 1, // Monday is the first day of the week.
        "doy": 4  // The week that contains Jan 4th is the first week of the year.
    }
};

export class ArLocale {

    months = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];
    monthsShort = ["كا ثاني.", "شبط.", "آذر", "نيس.", "أيا", "حزير", "تمو.", "آب", "أيلو.", "تش أول.", "تش ثاني.", "كا أول."];
    weekdays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    weekdaysShort = ["أحد.", "اثن.", "ثلات.", "أرب.", "خمس.", "جمع.", "سبت."];
    weekdaysMin = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
    longDateFormat = {
        "LT": "HH:mm",
        "LTS": "HH:mm:ss",
        "L": "DD/MM/YYYY",
        "LL": "D MMMM YYYY",
        "LLL": "D MMMM YYYY LT",
        "LLLL": "dddd D MMMM YYYY LT"
    };
    calendar = {
        "sameDay": "[اليوم في] LT",
        "nextDay": '[غداً في] LT',
        "nextWeek": 'dddd [à] LT',
        "lastDay": '[البارحة في] LT',
        "lastWeek": 'dddd [dernier à] LT',
        "sameElse": 'L'
    };
    relativeTime = {
        "future": "dans %s",
        "past": "il y a %s",
        "s": "quelques secondes",
        "m": "une minute",
        "mm": "%d minutes",
        "h": "une heure",
        "hh": "%d heures",
        "d": "un jour",
        "dd": "%d jours",
        "M": "un mois",
        "MM": "%d mois",
        "y": "une année",
        "yy": "%d années"
    };
    ordinalParse = "/\d{1,2}(er|ème)/";
    ordinal(number) {
        return number + (number === 1 ? 'er' : 'ème');
    };
    meridiemParse: "/PD|MD/";
    isPM(input) {
        return input.charAt(0) === "M";
    };
    // in case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example)
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */
    // },
    meridiem(hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    };
    week = {
        "dow": 1, // Monday is the first day of the week.
        "doy": 4  // The week that contains Jan 4th is the first week of the year.
    }
};

export class PrsLocale {

    months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    monthsShort = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    weekdaysShort = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    weekdaysMin = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
    longDateFormat = {
        "LT": "HH:mm",
        "LTS": "HH:mm:ss",
        "L": "DD/MM/YYYY",
        "LL": "D MMMM YYYY",
        "LLL": "D MMMM YYYY LT",
        "LLLL": "dddd D MMMM YYYY LT"
    };
    calendar = {
        "sameDay": "[Aujourd'hui à] LT",
        "nextDay": '[Demain à] LT',
        "nextWeek": 'dddd [à] LT',
        "lastDay": '[Hier à] LT',
        "lastWeek": 'dddd [dernier à] LT',
        "sameElse": 'L'
    };
    relativeTime = {
        "future": "dans %s",
        "past": "il y a %s",
        "s": "quelques secondes",
        "m": "une minute",
        "mm": "%d minutes",
        "h": "une heure",
        "hh": "%d heures",
        "d": "un jour",
        "dd": "%d jours",
        "M": "un mois",
        "MM": "%d mois",
        "y": "une année",
        "yy": "%d années"
    };
    ordinalParse = "/\d{1,2}(er|ème)/";
    ordinal(number) {
        return number + (number === 1 ? 'er' : 'ème');
    };
    meridiemParse: "/PD|MD/";
    isPM(input) {
        return input.charAt(0) === "M";
    };
    // in case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example)
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */
    // },
    meridiem(hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    };
    week = {
        "dow": 1, // Monday is the first day of the week.
        "doy": 4  // The week that contains Jan 4th is the first week of the year.
    }
};