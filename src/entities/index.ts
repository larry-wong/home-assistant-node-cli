/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-06 15:45
#
# Description:
#
=============================================================================*/

import { HassEntity } from 'home-assistant-js-websocket';
import { Entity } from './entity';
import { Light } from './light';
import { Cliamte } from './climate';
import { Cover } from './cover';
import { MediaPlayer } from './media-player';
import { Vacuum } from './vacuum';

const EntityCtrs = [Light, Cliamte, Cover, MediaPlayer, Vacuum, Entity];

export function createEntity(data: HassEntity): Entity {
    const ctr = EntityCtrs.find(c => c.FILTER_REG.test(data.entity_id));
    return new ctr!(data);
}
