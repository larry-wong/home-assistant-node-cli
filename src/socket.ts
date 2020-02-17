/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-01 23:14
#
# Description:
#
=============================================================================*/

import * as WebSocket from 'ws';
import { showError } from './utils';

const MSG_TYPE_AUTH_REQUIRED = 'auth_required';
const MSG_TYPE_AUTH_INVALID = 'auth_invalid';
const MSG_TYPE_AUTH_OK = 'auth_ok';

// create a websocket connection with hass via package ws
export async function createSocket(wsUrl: string, token: string): Promise<WebSocket> {
    let resolve: (socket: WebSocket) => void;

    function sendAuthMessage(socket: WebSocket) {
        socket.send(
            JSON.stringify({
                type: 'auth',
                access_token: token,
            }),
        );
    }

    function handleAuthInvalid(socket: WebSocket) {
        socket.removeAllListeners();
        showError('Auth failed, please check your configuration file.');
        process.exit(0);
    }

    function handleAuthOk(socket: WebSocket) {
        socket.removeAllListeners();
        resolve(socket);
    }

    function handleError(socket?: WebSocket) {
        if (socket) {
            socket.removeAllListeners();
        }
        showError('Failed to connect to hass, please check your configuration file.');
        process.exit(0);
    }

    function handleMessage(socket: WebSocket, event: WebSocket.MessageEvent) {
        const message = JSON.parse(event.data as string);
        switch (message.type) {
            case MSG_TYPE_AUTH_REQUIRED:
                sendAuthMessage(socket);
                break;
            case MSG_TYPE_AUTH_INVALID:
                handleAuthInvalid(socket);
                break;
            case MSG_TYPE_AUTH_OK:
                handleAuthOk(socket);
                break;
            default:
                break;
        }
    }

    try {
        const socket = new WebSocket(wsUrl);
        socket.addEventListener('message', handleMessage.bind(undefined, socket));
        socket.addEventListener('error', handleError.bind(undefined, socket));
        socket.addEventListener('close', handleError.bind(undefined, socket));
    } catch (e) {
        handleError();
    }

    return new Promise<WebSocket>(res => {
        resolve = res;
    });
}
