/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-09 02:00
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { Item } from './item';
import { debounce } from '../../utils';

const TOTAL_STEPS = 20;

export class Range extends Item<number> {
    private _label: string;

    private _value: number;

    private _min: number;

    private _max: number;

    private _step: number;

    private _notifyChange = debounce(() => {
        this._emitChange(this._value);
    }, 800);

    constructor(label: string, value: number, min: number, max: number, step: number) {
        super();
        this._label = label;
        this._value = value;
        this._min = min;
        this._max = max;
        this._step = step;
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

        this._bindLeft(box, () => {
            this._setValue(this._value - this._step);
        });

        this._bindRight(box, () => {
            this._setValue(this._value + this._step);
        });

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
        const fill = Math.round(((this._value - this._min) / (this._max - this._min)) * TOTAL_STEPS);
        const empty = TOTAL_STEPS - fill;

        // label:   min [######(value)---------] max
        return `${`${this._label}:    ${this._min} ${this._isFocused() ? '{inverse}' : ''}[`}${new Array(fill + 1).join(
            '#',
        )}(${this._value})${new Array(empty + 1).join('-')}]${this._isFocused() ? '{/}' : ''} ${this._max}`;
    }

    private _setValue(value: number) {
        const val = Math.min(this._max, Math.max(this._min, value));
        if (val === this._value) {
            return;
        }
        this._value = val;
        this._updateView();
        this._notifyChange();
    }
}
