/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-14 20:53
#
# Description:
#
=============================================================================*/

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as inquirer from 'inquirer';
import { showError } from './utils';
import { Connection } from './connection';
import { ERR_CANNOT_CONNECT, ERR_INVALID_AUTH } from './errors';

const CONFIG_FILE_NAME = '.hacrc.yaml';

interface IConfig {
    hassUrl: string;
    token: string;
}

export class Account {
    private static _instance: Account;

    // eslint-disable-next-line no-useless-constructor
    private constructor() {}

    public static getInstance(): Account {
        if (!this._instance) {
            this._instance = new Account();
        }
        return this._instance;
    }

    public async signIn(): Promise<void> {
        const config = await this._readConfigFile();

        let needWriteToFile = false;

        /* eslint-disable no-await-in-loop */
        async function getHassUrl(): Promise<string> {
            let hassUrl = '';
            while (!hassUrl) {
                hassUrl = (
                    await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'hassUrl',
                            message: 'Your hass url:',
                        },
                    ])
                ).hassUrl;
                needWriteToFile = true;
            }
            return hassUrl;
        }

        async function getToken(): Promise<string> {
            let token = '';
            while (!token) {
                token = (
                    await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'token',
                            message: 'Your long-lived access token:',
                        },
                    ])
                ).token;
                needWriteToFile = true;
            }
            return token;
        }

        let hassUrl = config.hassUrl || (await getHassUrl());
        let token = config.token || (await getToken());
        do {
            try {
                await Connection.getInstance().connect(hassUrl, token);
                break;
            } catch (e) {
                if (e === ERR_CANNOT_CONNECT) {
                    showError(`Failed to connect to ${hassUrl}.`);
                    hassUrl = await getHassUrl();
                } else if (e === ERR_INVALID_AUTH) {
                    showError('Invalid token.');
                    token = await getToken();
                } else {
                    showError(`Failed to connect to ${hassUrl}.`);
                }
            }

            // eslint-disable-next-line no-constant-condition
        } while (true);
        /* eslint-enable no-await-in-loop */

        // avoid following keyboard triggered twice
        process.stdin.removeAllListeners();

        if (needWriteToFile) {
            config.hassUrl = hassUrl;
            config.token = token;
            await this._writeConfigFile(config as IConfig);
        }
    }

    private async _writeConfigFile(config: IConfig) {
        try {
            const text = yaml.safeDump(config);
            await fs.promises.writeFile(this._getConfigFilePath(), text, 'utf8');
        } catch (e) {
            showError('Failed to write configuration file');
        }
    }

    private async _readConfigFile(): Promise<
        {
            [k in keyof IConfig]?: string;
        }
    > {
        try {
            const text = await fs.promises.readFile(this._getConfigFilePath(), 'utf8');
            return yaml.safeLoad(text) || {};
        } catch (e) {
            return {};
        }
    }

    private _getConfigFilePath(): string {
        return path.join(os.homedir(), CONFIG_FILE_NAME);
    }
}
