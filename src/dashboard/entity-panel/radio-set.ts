/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-07 14:14
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { Item } from './item';

export class RadioSet extends Item<string> {
    private _label: string;

    private _value: string;

    private _options: string[];

    constructor(label: string, value: string, options: string[]) {
        super();
        this._label = label;
        this._value = value;
        this._options = options;
    }

    public focus() {
        // focus on current checked radioButton or the first one
        if (this._node && this._node.children.length) {
            const children = this._node.children as blessed.Widgets.RadioButtonElement[];
            const node = children.find(c => c.checked) || children[0];
            node.focus();
        }
    }

    public blur() {
        // No Implemention
    }

    public getHeight(): number {
        return 1;
    }

    protected _createNode(): blessed.Widgets.BoxElement {
        const label = `${this._label}: `;

        const radioSet = blessed.radioset();
        radioSet.setText(label);

        if (!this._options || !this._options.length) {
            return radioSet;
        }

        const labelWidth = ~~radioSet.strWidth.call(radioSet, label);
        const radioButtonOffset = Math.ceil(labelWidth / this._options.length);
        const radioButtonWidth = Math.floor(100 / this._options.length);

        const radiosButtons = this._options.map((option, index) => {
            const radioButton = blessed.radiobutton({
                left: `${radioButtonWidth * index}%+${radioButtonOffset * (this._options.length - index)}`,
                style: {
                    /*
                      if the btn is focused when added to screen,
                      the cursor is not blinking
                      this empty attribute fixes this with no reason :-)
                    */
                    focus: {},
                },
            });
            radioButton.text = option;
            radioSet.append(radioButton);
            if (option === this._value) {
                radioButton.check();
            }

            radioButton.on('check', this._emitChange.bind(this, option));

            this._bindLeft(radioButton, () => {
                if (index === 0) {
                    // the leftmost one, through this event out
                    this._emitLeft();
                } else {
                    // focus the left one
                    radiosButtons[index - 1].focus();
                }
            });

            this._bindRight(radioButton, () => {
                if (index === radiosButtons.length - 1) {
                    // the rightmost one, through this event out
                    this._emitRight();
                } else {
                    // focus the right one
                    radiosButtons[index + 1].focus();
                }
            });

            this._bindUp(radioButton, this._emitUp.bind(this));

            this._bindDown(radioButton, this._emitDown.bind(this));

            this._bindShiftKes(radioButton);

            return radioButton;
        });

        return radioSet;
    }
}
