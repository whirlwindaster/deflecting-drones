import type { GenericMessageToAPI } from './types';

export function toMilliseconds(sec: number): number {
    return sec * 1000;
}

export function toSeconds(ms: number): number {
    return ms / 1000;
}

export function secondsToClockString(sec: number): string {
    const seconds = `${sec % 60}`.length === 1 ? `0${sec % 60}` : `${sec % 60}`;
    return `${Math.floor(sec / 60)}:${seconds}`;
}

export function wsSend(ws: WebSocket, message: GenericMessageToAPI) {
    if (ws.readyState !== 1) {
        return;
    }

    ws.send(JSON.stringify(message));
}

//export const API_HTTP_URL = 'https://dd-api.whirlwinda.st/er';
//export const API_WS_URL = 'wss://dd-api.whirlwinda.st/er/ws';
export const API_HTTP_URL = 'http://localhost:8765/er';
export const API_WS_URL = 'ws://localhost:8765/er/ws';
