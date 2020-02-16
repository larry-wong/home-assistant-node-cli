/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-09 22:43
#
# Description:
#
=============================================================================*/

import { IItemData, Entity } from './entity';

// ref: https://github.com/home-assistant/home-assistant/blob/dev/homeassistant/components/media_player/const.py
const SUPPORT_TURN_ON = 128;
const SUPPORT_TURN_OFF = 256;
const SUPPORT_VOLUME_STEP = 1024;

export class MediaPlayer extends Entity {
    public static FILTER_REG = /^media_player\./;

    public getItemData(): IItemData[] {
        const res: IItemData[] = [];

        if (this._supportedFeatures & SUPPORT_TURN_ON && this._supportedFeatures & SUPPORT_TURN_OFF) {
            res.push({
                type: 'radioSet',
                label: 'state',
                value: this._data.state,
                options: ['on', 'off'],
                serviceParamsFun: (val: string) => ({
                    domain: 'media_player',
                    service: `turn_${val}`,
                    data: {
                        entity_id: this._data.entity_id,
                    },
                }),
            });
        }

        if (this._supportedFeatures & SUPPORT_VOLUME_STEP) {
            res.push({
                type: 'stepper',
                label: 'volume',
                backwardLabel: '-',
                forwardLabel: '+',
                serviceParamsFun: (val: boolean) => ({
                    domain: 'media_player',
                    service: val ? 'volume_up' : 'volume_down',
                    data: {
                        entity_id: this._data.entity_id,
                    },
                }),
            });
        }

        return res;
    }
}
