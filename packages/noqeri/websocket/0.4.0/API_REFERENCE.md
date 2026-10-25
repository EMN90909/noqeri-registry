# websocket 0.4.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/websocket.noqeri
- Exported functions: 5
- Host externs: 4

## Exported API

- websocketCloseCodeValid
- websocketControlOpcode
- websocketHandleValid
- websocketOpcodeValid
- websocketPayloadLengthValid

## External host bindings required

- websocketClose
- websocketMessage
- websocketOpen
- websocketSend

These declarations need real host implementations; compiling does not provide network, database or cryptographic services.

## Capability status

No new algorithm was introduced for this module in this pass. Existing APIs remain experimental unless separately verified.
