/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-13 21:00
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { Item } from './item';

export class Message extends Item<void> {
    private _text: string;

    constructor(text: string) {
        super();
        this._text = text;
    }

    public focus() {
        if (this._node) {
            this._node.focus();
        }
    }

    public blur() {
        // No Implemention
    }

    public getHeight(): number {
        return 1;
    }

    protected _createNode(): blessed.Widgets.BoxElement {
        const box = blessed.box({
            fg: 'gray',
            padding: {
                left: 2,
            },
        });

        box.setText(this._text);

        this._bindLeft(box, this._emitLeft.bind(this));

        this._bindRight(box, this._emitRight.bind(this));

        this._bindUp(box, this._emitUp.bind(this));

        this._bindDown(box, this._emitDown.bind(this));

        this._bindShiftKes(box);

        return box;
    }
}
