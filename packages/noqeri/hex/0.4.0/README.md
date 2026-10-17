# noqeri/hex

Portable hexadecimal codec and integer formatting utilities written in Noqeri.

## What it provides

- lower- and upper-case byte encoding;
- strict decoding and validation;
- nibble/byte conversion helpers;
- `u64` hexadecimal parsing;
- configurable uppercase/lowercase `u64` formatting with minimum width;
- optional `0x`/`0X` prefix recognition;
- caller-owned buffers and explicit failure results.

No allocation or host I/O is required.

## Example

```noqeri
import "src/hex.nqr"

let bytes: [u8; 2] = [222 as u8,173 as u8]
let text: [u8; 4] = [0 as u8,0 as u8,0 as u8,0 as u8]

if hexEncode(slice(bytes), slice(text), true) != 4 as isize {
    throw 1
}
// text is DEAD
```

Test locally:

```sh
noqeri run tests/basic_test.nqr
```

License: GPL-3.0-only.
