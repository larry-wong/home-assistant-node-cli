/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-11 12:58
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { Item } from './item';

export class ButtonGroup extends Item<number> {
    private _label: string;

    private _buttons: string[];

    constructor(lable: string, buttons: string[]) {
        super();
        this._label = lable;
        this._buttons = buttons;
    }

    public focus() {
        // focus on the first button
        if (this._node && this._node.children.length) {
            (this._node.children[0] as blessed.Widgets.ButtonElement).focus();
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

        const box = blessed.box();

        const labelWidth = ~~box.strWidth.call(box, label);
        const buttonOffset = Math.ceil(labelWidth / this._buttons.length);
        const buttonWidth = Math.floor(100 / this._buttons.length);

        const buttons = this._buttons.map((text, index) => {
            const button = blessed.button({
                left: `${buttonWidth * index}%+${buttonOffset * (this._buttons.length - index)}`,
                width: box.strWidth.call(box, text) + 4, // < text >
                height: 1,
                style: {
                    underline: true,
                    focus: {
                        inverse: true,
                    },
                },
            } as any);

            button.setContent(`< ${text} >`);
            box.append(button);

            button.on('press', this._emitChange.bind(this, index));

            this._bindLeft(button, () => {
                if (index === 0) {
                    // the leftmost one, through this event out
                    this._emitLeft();
                } else {
                    // focus the left one
                    buttons[index - 1].focus();
                }
            });

            this._bindRight(button, () => {
                if (index === buttons.length - 1) {
                    // the rightmost one, through this event out
                    this._emitRight();
                } else {
                    // focus the right one
                    buttons[index + 1].focus();
                }
            });

            this._bindUp(button, this._emitUp.bind(this));

            this._bindDown(button, this._emitDown.bind(this));

            this._bindShiftKes(button);

            return button;
        });

        return box;
    }
}
