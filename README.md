# Timetabler
A tool to help choose options on a timetable where there might be multiple classes running!
Allows you to quickly select different time slots and checks for clashes for you as you go.

🚧 Currently offline while moving to a new home.

## Providing your timetable
Timetables should be provided by creating a valid `.json` file. Timetabler will prompt you for this on startup.
The schema for this file is provided in [data-schema.json](data-schema.json), and an example data file can be found in [example-data/the-usual-classes.json](example-data/the-usual-classes.json).

**Note:** The `times` property is not supported yet, so times are currently restricted to 8am - 8pm. Times outside this shouldn't break the tool, but will get cutoff from the timetable view. Sorry!
