class AppData {
    constructor(startHour, endHour, subjects) {
        this.startHour = startHour;
        this.endHour = endHour;
        this.subjects = subjects;
    }
}

function readData(jsonStr) {
    var json = JSON.parse(jsonStr);
    if (json.version !== "1") { throw "Unsupported version"; }

    let times = getTimes(json.times);

    if (json.subjects == null) { throw "No 'subjects' array"; }
    if (json.subjects.map == null) { throw "'subjects' should be an array"; }

    let subjects = json.subjects.map(s => parseSubject(s));

    return new AppData(times.start, times.end, subjects);
}
function getTimes(str) {
    const errorMsg = "'times' should be two times separated by a dash, e.g. '8am-8pm'";
    
    if (str.split == null) { throw errorMsg; }
    let args = str.split('-');
    if (args.length !== 2) { throw errorMsg; }

    args = args.map(a => a.replace(/ /g, ''));
    let startTime = parseTime(args[0]);
    let endTime = parseTime(args[1]);

    let start = startTime.hr;
    let end = endTime.min === 0 ? endTime.hr : endTime.hr + 1;
    if (end == 0) { end = 24; }

    if (start > end) { throw "Provided 'times' require time travel"; }
    return { start: start, end: end };
}
function parseTime(str) {
    if (str == null || str.toLowerCase == null) { throw "A time should be a string"; }
    str = str.toLowerCase();
    var test = /^[0-9]{1,2}(:[0-9]{2} ?([ap]m)?| ?[ap]m)$/;
    if (!test.test(str)) { throw `'${str}' doesn't seem like a time, try something like '8pm' or '16:40'`; }
    str = str.replace(' ', '');

    let nums = str.split(':');
    let hr = parseInt(nums[0]);
    let minsStr = nums[1];
    if (minsStr == null) { minsStr = "0"; }
    minsStr = minsStr.replace(/[ap]m/g, '');
    let min = parseInt(minsStr);

    if (str.endsWith('am')) { return { hr: hr % 12, min: min % 60 }; }
    if (str.endsWith('pm')) { return { hr: hr % 12 + 12, min: min % 60 }; }
    return { hr: hr % 24, min: min % 60 };
}
function parseSubject(json) {
    let name = json.name;
    if (name == null || name.split == null) { throw "Subject missing a 'name', or it wasn't a string."; }
    let shortName = acronymize(name);

    let type = json.type;
    if (type == null || type.split == null) { throw "Subject missing a 'type', or it wasn't a string."; }
    let color = colorFromName(json.color);

    let optionsGroups = parseOptionsGroups(json.options);

    return new Subject(name, shortName, type, color, optionsGroups);
}
function acronymize(name) {
    if (name.length <= 3) { return name; }
    let words = name.trim().split(' ').map(x => x.trim());
    words = words.map(x => x.length <= 3 ? x : x[0] + x.slice(1).replace(/[aeiouAEIOU]/g, ''));
    words = words.map(x => x.slice(0, 3));
    return words.slice(0, 3).join(' ');
}
function parseOptionsGroups(json) {
    if (json == null || json.map == null) { throw "A subjects 'options' should be an array containing strings, or arrays of strings, or both"; }

    return json.map(group => {
        if (group == null) { throw "'options' should only contain strings or arrays of strings"; }
        if (group.split != null) {
            return [parseSlot(group)];
        }
        if (group.map != null) {
            return group.map(x => parseSlot(x));
        }
    });
}
function parseSlot(str) {
    if (str == null || str.trim == null) { throw "'options' should only contain strings or arrays of strings"; } 
    let words = str.trim().split(' ').map(x => x.trim());

    const errorMsg = "Each slot in 'options' should be a string with three/four terms, e.g. 'fri 8:30 2h' or 'mon 15:30 30m online'";
    if (words.length < 3) { throw errorMsg; }

    let dayOfWeek = dayOfWeekFromAcronym(words[0]);
    let time = parseTime(words[1]);
    let lengthMins = parseDuration(words[2]);
    let isOnline = words[3] === "online";

    if (words[3] != null && words[3] != "online") { throw "The last word in a slot must be 'online' or nothing."; }

    return new SubjectOption(dayOfWeek, time.hr * 60 + time.min, lengthMins, isOnline);
}
function parseDuration(str) {
    if (str == null || str.toLowerCase == null) { throw "A duration should be a string"; }
    str = str.toLowerCase();
    var test = /^[0-9]{1,2}[hm]$/;
    if (!test.test(str)) { throw `'${str}' doesn't seem like a duration, try something like '2h' or '30m'`; }
    
    if (str.endsWith('m')) { return parseInt(str.replace('m', '')); }
    if (str.endsWith('h')) { return parseInt(str.replace('h', '')) * 60; }
}