/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-06 16:21
#
# Description:
#
=============================================================================*/

import { IServiceParams, IItemData, Entity } from './entity';

// ref: https://github.com/home-assistant/home-assistant/blob/dev/homeassistant/components/climate/const.py
const SUPPORT_TARGET_TEMPERATURE = 1;
const SUPPORT_FAN_MODE = 8;
const SUPPORT_SWING_MODE = 32;

export class Cliamte extends Entity {
    public static FILTER_REG = /^climate\./;

    public get historyState(): string {
        const state = [this.state];
        if (this._data.attributes.temperature) {
            state.push(this._data.attributes.temperature);
        }
        if (this._data.attributes.fan_mode) {
            state.push(this._data.attributes.fan_mode);
        }
        if (this._data.attributes.swing_mode) {
            state.push(this._data.attributes.swing_mode);
        }
        return state.join(', ');
    }

    public getToggleServiceParams(): IServiceParams {
        return {
            domain: 'climate',
            service: this._data.state === 'off' ? 'turn_on' : 'turn_off',
            data: {
                entity_id: this._data.entity_id,
            },
        };
    }

    public getItemData(): IItemData[] {
        const res: IItemData[] = [];

        if (this._data.attributes.hvac_modes && this._data.attributes.hvac_modes.length) {
            res.push({
                type: 'radioSet',
                label: 'hvac mode',
                value: this._data.state,
                options: this._data.attributes.hvac_modes,
                serviceParamsFun: (val: string) => ({
                    domain: 'climate',
                    service: 'set_hvac_mode',
                    data: {
                        entity_id: this._data.entity_id,
                        hvac_mode: val,
                    },
                }),
            });
        }

        if (
            this._supportedFeatures & SUPPORT_TARGET_TEMPERATURE &&
            !Number.isNaN(this._data.attributes.temperature) &&
            !Number.isNaN(this._data.attributes.min_temp) &&
            !Number.isNaN(this._data.attributes.max_temp) &&
            !Number.isNaN(this._data.attributes.target_temp_step)
        ) {
            res.push({
                type: 'range',
                label: 'temperature',
                value: this._data.attributes.temperature,
                min: this._data.attributes.min_temp,
                max: this._data.attributes.max_temp,
                step: this._data.attributes.target_temp_step,
                serviceParamsFun: (val: number) => ({
                    domain: 'climate',
                    service: 'set_temperature',
                    data: {
                        entity_id: this._data.entity_id,
                        temperature: val,
                    },
                }),
            });
        }

        if (
            this._supportedFeatures & SUPPORT_FAN_MODE &&
            this._data.attributes.fan_mode &&
            this._data.attributes.fan_modes
        ) {
            res.push({
                type: 'radioSet',
                label: 'fan mode',
                value: this._data.attributes.fan_mode,
                options: this._data.attributes.fan_modes,
                serviceParamsFun: (val: string) => ({
                    domain: 'climate',
                    service: 'set_fan_mode',
                    data: {
                        entity_id: this._data.entity_id,
                        fan_mode: val,
                    },
                }),
            });
        }

        if (
            this._supportedFeatures & SUPPORT_SWING_MODE &&
            this._data.attributes.swing_mode &&
            this._data.attributes.swing_modes
        ) {
            res.push({
                type: 'radioSet',
                label: 'swing mode',
                value: this._data.attributes.swing_mode,
                options: this._data.attributes.swing_modes,
                serviceParamsFun: (val: string) => ({
                    domain: 'climate',
                    service: 'set_swing_mode',
                    data: {
                        entity_id: this._data.entity_id,
                        swing_mode: val,
                    },
                }),
            });
        }

        return res;
    }
}
