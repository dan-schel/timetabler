function init() {
    $(document).on("input", "#load-config-file", (e) => {
        let file = e.target.files[0];
        var fileread = new FileReader();
        fileread.onload = function(e) {
            var content = e.target.result;
            try {
                let data = readData(content);

                $(".load-config").addClass("gone");
                $(".options").removeClass("gone");
                $(".timetable").removeClass("gone");
                createSelects(data.subjects);
            }
            catch (ex) {
                if (ex instanceof SyntaxError) {
                    $("#load-config-error").text("That didn't seem to be a .json file");
                }
                else {
                    $("#load-config-error").text(ex);
                }
                $("#load-config-error").removeClass("gone");
            }
        };
        fileread.readAsText(file);
    });
}
init();

function createSelects(subjects) {
    for (let i in subjects) {
        let subject = subjects[i];

        let optionsHtml = subject.optionGroups.map((option, j) => {

            let name = option.map((slot) => {
                let dayOfWeek = dayOfWeekString(slot.dayOfWeek);
                let startTime = minsToTime(slot.startMin);
                let endTime = minsToTime(slot.startMin + slot.lengthMins);
                let onlineSuffix = slot.isOnline ? " (Online)" : "";
                return `${dayOfWeek} ${startTime} - ${endTime}${onlineSuffix}`;
            }).join(' & ');

            return `<option value="${j}">${name}</option>`;
        }).join('');
        let html = `<div class="subject" id="subject-${i}"><p style="color:${subject.color}">${subject.name} (${subject.type})</p><select><option>Choose a time slot...</option>${optionsHtml}</select></div>`;

        $('.subjects').append(html);

        $(`.subjects #subject-${i}`).on('change', () => {
            var option = parseInt($(`.subjects #subject-${i} option:selected`).val());
            subject.selected = isNaN(option) ? null : option;
            renderTimetable(subjects);
        });
    }
}

function renderTimetable(subjects) {
    $('.timetable-classes .timetable-class').remove();

    for (let subject of subjects) {
        if (subject.selected == null) { continue; }

        let option = subject.optionGroups[subject.selected];

        for (let slot of option) {
            let startMin = slot.startMin;
            let endMin = slot.startMin + slot.lengthMins;
    
            // Ensure can't go outside grid boundaries
            let startHr = Math.min(Math.max(startMin, START_OF_DAY), END_OF_DAY) / 60;
            let endHr = Math.min(Math.max(endMin, START_OF_DAY), END_OF_DAY) / 60;
    
            if (startHr === endHr) { continue; }
    
            let startHrsOffset = startHr - START_OF_DAY / 60;
            let lengthHrs = endHr - startHr;
    
            let startTimeStr = minsToTime(slot.startMin);
            let endTimeStr = minsToTime(slot.startMin + slot.lengthMins);
    
            let style = `left:calc(14.285%*${slot.dayOfWeek});height:calc(8.333%*${lengthHrs});top:calc(8.333%*${startHrsOffset});`;
            let bgStyle = slot.isOnline ? `background-color:white;border:2px solid ${subject.color};` : `background-color:${subject.color};`;
            let bgClass = slot.isOnline ? "timetable-class-bg timetable-class-bg-online" : "timetable-class-bg";
    
            let html = `<div class="timetable-class" style="${style}">
                            <div class="${bgClass}" style="${bgStyle}">
                                <h5>${subject.shortName}</h5>
                                <h5>${subject.type}</h5>
                                <p>${startTimeStr} - ${endTimeStr}</p>
                            </div>
                        </div>`;
            
            $('.timetable-classes').append(html);
        }
    }

    if (checkClashes(subjects)) {
        $(".options #timetable-status-clash").removeClass("gone");
    }
    else {
        $(".options #timetable-status-clash").addClass("gone");
    }
}

function checkClashes(subjects) {
    for (let i in subjects) {
        let subjectA = subjects[i];
        if (subjectA.selected == null) { continue; }
        let optionA = subjectA.optionGroups[subjectA.selected];

        for (let j in subjects) {
            if (i === j) { continue; }
            
            let subjectB = subjects[j];
            if (subjectB.selected == null) { continue; }
            let optionB = subjectB.optionGroups[subjectB.selected];

            for (let slotA of optionA) {
                for (let slotB of optionB) {
                    if (slotsOverlap(slotA, slotB)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function slotsOverlap(slotA, slotB) {
    if (slotA.dayOfWeek !== slotB.dayOfWeek) { return false; }
    let startA = slotA.startMin;
    let endA = slotA.startMin + slotA.lengthMins;
    let startB = slotB.startMin;
    let endB = slotB.startMin + slotB.lengthMins;
    return (startA >= startB && startA < endB) || (endA > startB && endA <= endB);
}
