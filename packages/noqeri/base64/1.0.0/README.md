# noqeri/base64

Portable Base64 and Base64URL codecs written in Noqeri.

## What it provides

- standard Base64 encode/decode;
- URL-safe Base64 encode/decode using `-` and `_`;
- padded and unpadded URL-safe output;
- strict standard alphabet/padding validation;
- encoded/decoded sizing helpers;
- caller-owned output buffers with `-1` on invalid input or insufficient capacity.

The package performs no allocation and no I/O. This makes it suitable for files, HTTP tokens, JSON payloads, protocol fields and embedded/freestanding code where the caller controls storage.

## Example

```noqeri
import "src/base64.nqr"

let input: [u8; 3] = [77 as u8,97 as u8,110 as u8]
let output: [u8; 4] = [0 as u8,0 as u8,0 as u8,0 as u8]

if base64Encode(slice(input), slice(output)) != 4 as isize {
    throw 1
}
// output is TWFu
```

Run the package test with the Noqeri compiler from this version directory:

```sh
noqeri run tests/basic_test.nqr
```

License: GPL-3.0-only.
