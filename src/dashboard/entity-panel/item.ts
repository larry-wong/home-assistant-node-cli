/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-07 13:52
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { ViewObject } from '../view-object';

// T: callback data type
export abstract class Item<T = any> extends ViewObject<blessed.Widgets.BoxElement> {
    public onChange(listener: (val: T) => void) {
        this.on('change', listener);
    }

    public setTop(top: number) {
        if (this._node) {
            this._node.top = top;
        }
    }

    protected _emitChange(data: T) {
        this.emit('change', data);
    }

    public abstract getHeight(): number;
}
