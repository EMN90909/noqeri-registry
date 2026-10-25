# time 1.0.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/time.noqeri
- Exported functions: 7
- Host externs: 1

## Exported API

- elapsedMillis
- hoursToMillis
- minutesToMillis
- secondsToMillis
- timeDateValid
- timeDaysInMonth
- timeLeapYear

## External host bindings required

- timeNowMillis

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Expanded functionality

Gregorian calendar functions with leap-year and month-boundary checks.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
