/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-09 16:13
#
# Description:
#
=============================================================================*/

import { IItemData, Entity } from './entity';

// ref: https://github.com/home-assistant/home-assistant/blob/dev/homeassistant/components/light/__init__.py
const SUPPORT_BRIGHTNESS = 1;
const SUPPORT_COLOR_TEMP = 2;
const SUPPORT_COLOR = 16;

export class Light extends Entity {
    public static FILTER_REG = /^light\./;

    public getItemData(): IItemData[] {
        const res: IItemData[] = [
            {
                type: 'radioSet',
                label: 'state',
                value: this._data.state,
                options: ['on', 'off'],
                serviceParamsFun: (val: string) => ({
                    domain: 'light',
                    service: `turn_${val}`,
                    data: {
                        entity_id: this._data.entity_id,
                    },
                }),
            },
        ];

        if (this._supportedFeatures & SUPPORT_BRIGHTNESS && Number.isInteger(this._data.attributes.brightness)) {
            res.push({
                type: 'range',
                label: 'brightness',
                value: this._data.attributes.brightness,
                min: 0,
                max: 255,
                step: 20,
                serviceParamsFun: (val: number) => ({
                    domain: 'light',
                    service: 'turn_on',
                    data: {
                        entity_id: this._data.entity_id,
                        brightness: val,
                    },
                }),
            });
        }

        if (this._supportedFeatures & SUPPORT_COLOR_TEMP && Number.isInteger(this._data.attributes.color_temp)) {
            res.push({
                type: 'range',
                label: 'color temp',
                value: this._data.attributes.color_temp,
                min: this._data.attributes.min_mireds,
                max: this._data.attributes.max_mireds,
                step: 20,
                serviceParamsFun: (val: number) => ({
                    domain: 'light',
                    service: 'turn_on',
                    data: {
                        entity_id: this._data.entity_id,
                        color_temp: val,
                    },
                }),
            });
        }

        if (this._supportedFeatures & SUPPORT_COLOR && Array.isArray(this._data.attributes.rgb_color)) {
            const rgbColor = this._data.attributes.rgb_color;
            ['r', 'g', 'b'].forEach((label, index) => {
                res.push({
                    type: 'range',
                    label,
                    value: rgbColor[index],
                    min: 0,
                    max: 255,
                    step: 5,
                    serviceParamsFun: (val: number) => {
                        rgbColor[index] = val;
                        return {
                            domain: 'light',
                            service: 'turn_on',
                            data: {
                                entity_id: this._data.entity_id,
                                rgb_color: rgbColor,
                            },
                        };
                    },
                });
            });
        }

        return res;
    }
}
