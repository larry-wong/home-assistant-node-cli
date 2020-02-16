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

    const socket = new WebSocket(wsUrl);

    function sendAuthMessage() {
        socket.send(
            JSON.stringify({
                type: 'auth',
                access_token: token,
            }),
        );
    }

    function handleMessage(event: WebSocket.MessageEvent) {
        const message = JSON.parse(event.data as string);
        switch (message.type) {
            case MSG_TYPE_AUTH_REQUIRED:
                sendAuthMessage();
                break;
            case MSG_TYPE_AUTH_INVALID:
                socket.removeAllListeners();
                showError('Auth failed, please check your configuration file.');
                break;
            case MSG_TYPE_AUTH_OK:
                socket.removeAllListeners();
                resolve(socket);
                break;
            default:
                break;
        }
    }

    function handleError() {
        socket.removeAllListeners();
        showError('Failed to connect to hass, please check your configuration file.');
    }

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);
    socket.addEventListener('close', handleError);

    return new Promise<WebSocket>(res => {
        resolve = res;
    });
}
