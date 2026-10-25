# websocket 1.0.0 API inventory

Generated from the release's Noqeri source. **Listed does not mean tested or production-qualified.**

- Entry: src/websocket.noqeri
- Exported functions: 7
- Host externs: 4

## Exported API

- websocketClientFrameValid
- websocketCloseCodeValid
- websocketControlFrameValid
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

## Expanded functionality

WebSocket control-frame validation, including FIN and payload constraints.

Run tests/capability_regression.noqeri using a compatible Noqeri compiler.
