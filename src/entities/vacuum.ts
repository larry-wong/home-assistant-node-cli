/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-10 21:24
#
# Description:
#
=============================================================================*/

import { IItemData, Entity } from './entity';

// ref: https://github.com/home-assistant/home-assistant/blob/dev/homeassistant/components/vacuum/__init__.py
const SUPPORT_TURN_ON = 1;
const SUPPORT_TURN_OFF = 2;
const SUPPORT_PAUSE = 4;
const SUPPORT_STOP = 8;
const SUPPORT_RETURN_HOME = 16;
const SUPPORT_LOCATE = 512;

export class Vacuum extends Entity {
    public static FILTER_REG = /^vacuum\./;

    public getItemData(): IItemData[] {
        const flag = this._data.attributes.supported_features || 0;
        const res: IItemData[] = [];

        if (flag & SUPPORT_TURN_ON && flag & SUPPORT_TURN_OFF) {
            res.push({
                type: 'radioSet',
                label: 'state',
                value: this._data.state,
                options: ['on', 'off'],
                serviceParamsFun: (val: string) => ({
                    domain: 'vacuum',
                    service: `turn_${val}`,
                    data: {
                        entity_id: this._data.entity_id,
                    },
                }),
            });
        }

        const buttons: {
            text: string;
            service: string;
        }[] = [];
        if (flag & SUPPORT_PAUSE) {
            buttons.push({
                text: 'pause/resume',
                service: 'start_pause',
            });
        }
        if (flag & SUPPORT_STOP) {
            buttons.push({
                text: 'stop',
                service: 'stop',
            });
        }
        if (flag & SUPPORT_LOCATE) {
            buttons.push({
                text: 'locate',
                service: 'locate',
            });
        }
        if (flag & SUPPORT_RETURN_HOME) {
            buttons.push({
                text: 'home',
                service: 'return_to_base',
            });
        }
        if (buttons.length) {
            res.push({
                type: 'buttonGroup',
                label: '    ',
                buttons: buttons.map(btn => btn.text),
                serviceParamsFun: (val: number) => ({
                    domain: 'vacuum',
                    service: buttons[val].service,
                    data: {
                        entity_id: this._data.entity_id,
                    },
                }),
            });
        }

        return res;
    }
}
