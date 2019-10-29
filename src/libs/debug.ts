import debug from 'debug'

export const Debug = {
  info: debug('sk-ble:info'),
  send: debug('sk-ble:send'),
  receive: debug('sk-ble:receive'),
  resolve: debug('sk-ble:resolve'),
  attitude: (a) => { }, // debug('sk-ble:attitude'),
  attitudeRaw: debug('sk-ble:attitudeRaw'),
  rotate: debug('sk-ble:rotate'),
  gpioData: debug('sk-ble:gpioData'),
  warn: debug('sk-ble:warn'),
  cubeState: debug('sk-ble:cubeState'),
  debugInfo: debug('sk-ble:debugInfo'),
  WebSocket: {
    send: debug('sk-ble:websocket:send'),
    receive: debug('sk-ble:websocket:receive'),
    info: debug('sk-ble:websocket:info'),
  }
}

