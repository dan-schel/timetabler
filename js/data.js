function dayOfWeekString(dayOfWeek) {
    if (dayOfWeek === 0) { return 'Monday'; }
    if (dayOfWeek === 1) { return 'Tuesday'; }
    if (dayOfWeek === 2) { return 'Wednesday'; }
    if (dayOfWeek === 3) { return 'Thursday'; }
    if (dayOfWeek === 4) { return 'Friday'; }
    if (dayOfWeek === 5) { return 'Saturday'; }
    if (dayOfWeek === 6) { return 'Sunday'; }
}
function minsToTime(mins) {
    let timeHrs = (Math.floor(mins / 60) - 1) % 12 + 1;
    let timeMins = mins % 60;
    let dayHalf = mins < 12 * 60 ? "am" : "pm";
    return `${timeHrs}:${String(timeMins).padStart(2, '0')}${dayHalf}`;
}

const AM = 0;
const PM = 1;
const MON = 0;
const TUE = 1;
const WED = 2;
const THU = 3;
const FRI = 4;
const SAT = 5;
const SUN = 6;
const ONLINE = true;
const ON_CAMPUS = false;

function time(hours, minutes, ampm) {
    if (ampm == null) { return hours * 60 + minutes; }
    return ampm === PM ? ((hours % 12) * 60 + minutes + 12 * 60) : ((hours % 12) * 60 + minutes);
}

class Subject {
    constructor(name, shortName, type, color, optionGroups) {
        this.name = name;
        this.shortName = shortName;
        this.type = type;
        this.optionGroups = optionGroups;
        this.color = color;
        this.selected = null;
    }
}
class SubjectOption {
    constructor(dayOfWeek, startMin, lengthMins, isOnline) {
        this.dayOfWeek = dayOfWeek;
        this.startMin = startMin;
        this.lengthMins = lengthMins;
        this.isOnline = isOnline;
    }
}

const START_OF_DAY = time(8, 0, AM);
const END_OF_DAY = time(8, 0, PM);

function colorFromName(name) {
    if (name === "orange") { return "#aa3c11"; }
    if (name === "green") { return "#33871c"; }
    if (name === "blue") { return "#1c6587"; }
    if (name === "purple") { return "#531c87"; }
    throw `Unsupported color '${name}'`;
}
function dayOfWeekFromAcronym(acronym) {
    if (acronym === "mon") { return 0; }
    if (acronym === "tue") { return 1; }
    if (acronym === "wed") { return 2; }
    if (acronym === "thu") { return 3; }
    if (acronym === "fri") { return 4; }
    if (acronym === "sat") { return 5; }
    if (acronym === "sun") { return 6; }
    throw `Unsupported day acronym '${acronym}'`;
}