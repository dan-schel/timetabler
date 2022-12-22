# Timetabler

A tool designed to help you visualise your uni timetable preferences while you choose them.

✅ Live at [timetabler.danschellekens.com](https://timetabler.danschellekens.com)!

## Providing your timetable

Timetables can be provided by creating a `.json` file, and then clicking "import". An example of a valid `.json` file is given below:

```json
{
  "$schema": "https://timetabler.danschellekens.com/schema-v2.json",
  "version": "2",
  "classes": [
    {
      "name": "Planetary Colonisation Fundamentals",
      "type": "Lecture",
      "color": "red",
      "options": ["mon 13:00 2h online", "tue 14:30 2h", "fri 08:00 2h"],
      "optional": true
    },
    {
      "name": "Advanced Tin Opening",
      "type": "Workshop",
      "color": "blue",
      "options": [
        ["tue 16:30 30m", "fri 09:30 90m"],
        ["thu 12:00 30m online", "fri 14:00 90m online"],
        ["sat 10:00 30m", "sun 10:00 90m"]
      ]
    }
  ]
}
```

The file contains an array of `classes`, each one having:

- `name`: The name of the class (can be anything)
- `type`: The type of class it is (can be anything)
- `color`: The color to show on the timetable (either `"red"`, `"orange"`, `"yellow"`, `"green"`, `"cyan"`, `"blue"`, `"purple"`, or `"pink"`).
- `options`: An array containing each possible scheduling option/preference. Can contain strings, or arrays of strings if multiple time blocks come as a group. Strings must be in the format `"<day> <time> <duration> [online]"`.
- `optional`: True, if this class isn't required to be on the timetable for it to be considered valid. Defaults to false if not provided.

The `.json` file will also be rejected if classes, options, or time blocks within the same option are duplicated.
