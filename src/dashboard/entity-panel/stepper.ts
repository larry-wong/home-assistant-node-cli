/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-10 20:44
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { Item } from './item';

export class Stepper extends Item<boolean> {
    private _label: string;

    private _backwardLabel: string;

    private _forwardLabel: string;

    constructor(label: string, backwardLabel: string, forwardLabel: string) {
        super();
        this._label = label;
        this._backwardLabel = backwardLabel;
        this._forwardLabel = forwardLabel;
    }

    public getHeight() {
        return 1;
    }

    protected _createNode(): blessed.Widgets.BoxElement {
        const box = blessed.box({
            tags: true,
        });

        box.on('focus', this._updateView.bind(this));

        box.on('blur', this._updateView.bind(this));

        this._bindLeft(box, this._emitChange.bind(this, false));

        this._bindRight(box, this._emitChange.bind(this, true));

        this._bindUp(box, this._emitUp.bind(this));

        this._bindDown(box, this._emitDown.bind(this));

        this._bindShiftKes(box);

        return box;
    }

    protected _updateView() {
        if (this._node) {
            this._node.setContent(this._generateText());
        }
        super._updateView();
    }

    private _generateText(): string {
        return (
            `${this._label}:    ` +
            `${this._backwardLabel} ` +
            `${this._isFocused() ? '{inverse}' : ''}` +
            '<--|-->' +
            `${this._isFocused() ? '{/}' : ''}` +
            ` ${this._forwardLabel}`
        );
    }
}
