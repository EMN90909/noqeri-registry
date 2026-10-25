# noqeri/net 0.1.1

**International preview | MIT | Noqeri Edition 2026**

Strict IP address text validation, IPv4 octet parsing, transport port checks and CIDR prefix inspection.

The new implementation exports 8 functions. Refer to API_REFERENCE.md for full details and host bindings.

## Run

noqeri check tests/regression.noqeri

noqeri run tests/regression.noqeri

The pure-logic tests must print 0. Hosted functions require external integration tests.

## Limitations

Byte-oriented IPv4 helpers only; IPv6, DNS resolution and actual network sockets need a host. Text checks do not enforce DNS rebinding/SSRF protections.

Old GPL-3.0-only releases retain their original notices. This new source is MIT.
