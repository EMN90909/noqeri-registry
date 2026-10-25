# noqeri/net 0.1.1 API Reference

## 8 exported functions

- netCidrPrefixValid
- netEphemeralPort
- netHostNameChar
- netHostNameValid
- netIpv4ToOctets
- netIpv4Valid
- netPortValid
- netPrivateIpv4

## 0 external host bindings


## Scope

Strict IP address text validation, IPv4 octet parsing, transport port checks and CIDR prefix inspection.

## Limitations

Byte-oriented IPv4 helpers only; IPv6, DNS resolution and actual network sockets need a host. Text checks do not enforce DNS rebinding/SSRF protections.
