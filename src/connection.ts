/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-01 15:42
#
# Description:
#
=============================================================================*/

import * as hajw from 'home-assistant-js-websocket';
import * as axios from 'axios';
import { createSocket } from './socket';
import { debounce } from './utils';

export class Connection {
    private static _instance: Connection;

    private _connection: hajw.Connection;

    private _axiosInstance: axios.AxiosInstance;

    // eslint-disable-next-line no-useless-constructor
    private constructor() {}

    public static getInstance(): Connection {
        if (!this._instance) {
            this._instance = new Connection();
        }
        return this._instance;
    }

    public async connect(hassUrl: string, token: string) {
        this._connection = await hajw.createConnection({
            createSocket: createSocket.bind(undefined, `ws${hassUrl.substr(4)}/api/websocket`, token),
        });
        this._axiosInstance = axios.default.create({
            baseURL: `${hassUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
    }

    public subscribeEntities(listener: (entities: hajw.HassEntity[]) => void) {
        if (listener instanceof Function) {
            hajw.subscribeEntities(this._connection, entities => {
                const keys = Object.keys(entities).sort();
                listener(keys.map(key => entities[key]));
            });
        }
    }

    // hass does not provide ws histroy api
    // we subscribe ws events and then fecth history via rest api
    public subscribeHistory(listener: (history: hajw.HassEntity[]) => void) {
        if (!(listener instanceof Function)) {
            return;
        }

        // hass triggers events very offen, we add debounce here (1s)
        const fetchHistory = debounce(async () => {
            // last 24 hours by default
            const history: hajw.HassEntity[] = Array.prototype.concat.apply(
                [],
                (await this._axiosInstance.get('/history/peiod')).data,
            );
            history.sort((a, b) => {
                if (a.last_updated > b.last_updated) {
                    return 1;
                }
                if (a.last_updated < b.last_updated) {
                    return -1;
                }
                return 0;
            });
            listener(history);
        }, 1e3);

        fetchHistory();
        this._connection.subscribeEvents(fetchHistory);
    }

    public async callService(domain: string, service: string, serviceData?: object) {
        await hajw.callService(this._connection, domain, service, serviceData);
    }
}
