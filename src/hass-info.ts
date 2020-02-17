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

const CONFIG_FILE_NAME = '.haclirc.yaml';

interface IConfig {
    hassUrl: string;
    token: string;
}

export class HassInfo {
    private static _instance: HassInfo;

    // eslint-disable-next-line no-useless-constructor
    private constructor() {}

    public static getInstance(): HassInfo {
        if (!this._instance) {
            this._instance = new HassInfo();
        }
        return this._instance;
    }

    public async getInfo(): Promise<IConfig> {
        const config = await this._readConfigFile();
        if (!config.hassUrl || !config.token) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    when: !config.hassUrl,
                    name: 'hassUrl',
                    message: 'Your hass url:',
                },
                {
                    type: 'input',
                    when: !config.token,
                    name: 'token',
                    message: 'Your long-lived access token:',
                },
            ]);
            Object.assign(config, answers);

            // avoid following keyboard triggered twice
            process.stdin.removeAllListeners();

            await this._writeConfigFile(config as IConfig);
        }

        return config as IConfig;
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
