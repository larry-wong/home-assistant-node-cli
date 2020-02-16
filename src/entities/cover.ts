/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-09 22:23
#
# Description:
#
=============================================================================*/

import { IItemData, Entity } from './entity';

// ref: https://github.com/home-assistant/home-assistant/blob/dev/homeassistant/components/cover/__init__.py
const SUPPORT_OPEN = 1;
const SUPPORT_CLOSE = 2;
const SUPPORT_SET_POSITION = 4;

export class Cover extends Entity {
    public static FILTER_REG = /^cover\./;

    public getItemData(): IItemData[] {
        const res: IItemData[] = [];

        if (this._supportedFeatures & SUPPORT_OPEN && this._supportedFeatures & SUPPORT_CLOSE) {
            res.push({
                type: 'radioSet',
                label: 'state',
                value: this._data.state,
                options: ['open', 'closed'],
                serviceParamsFun: (val: string) => ({
                    domain: 'cover',
                    service: val === 'open' ? 'open_cover' : 'close_cover',
                    data: {
                        entity_id: this._data.entity_id,
                    },
                }),
            });
        }

        if (
            this._supportedFeatures & SUPPORT_SET_POSITION &&
            Number.isInteger(this._data.attributes.current_position)
        ) {
            res.push({
                type: 'range',
                label: 'position',
                value: this._data.attributes.current_position,
                min: 0,
                max: 100,
                step: 10,
                serviceParamsFun: (val: number) => ({
                    domain: 'cover',
                    service: 'set_cover_position',
                    data: {
                        entity_id: this._data.entity_id,
                        position: val,
                    },
                }),
            });
        }

        return res;
    }
}
