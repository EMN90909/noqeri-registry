# noqeri/csv

Allocation-free CSV record parsing and writing utilities written in Noqeri.

## What it provides

- quoted and unquoted field scanning;
- doubled-quote escaping/unescaping;
- record validation and column counting;
- comma, semicolon, tab and pipe delimiters;
- caller-owned field spans through `CsvField`;
- escaped-size calculation before writing;
- two-field row composition without hidden temporary allocation;
- explicit failure when input is malformed or output capacity is insufficient.

The parser operates on one record at a time. File streaming, character-set conversion and schema/type inference belong in higher-level IO/data packages rather than being hidden here.

## Example

```noqeri
import "src/csv.nqr"

let first: [u8; 3] = [97 as u8,44 as u8,98 as u8]
let second: [u8; 2] = [111 as u8,107 as u8]
let row: [u8; 8] = [0 as u8,0 as u8,0 as u8,0 as u8,0 as u8,0 as u8,0 as u8,0 as u8]

if csvJoin2(slice(first), slice(second), slice(row), 44 as u8) != 8 as isize {
    throw 1
}
```

Test locally:

```sh
noqeri run tests/basic_test.nqr
```

License: GPL-3.0-only.
