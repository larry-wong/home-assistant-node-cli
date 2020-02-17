/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-02 21:30
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { ViewObject } from '../view-object';
import { Connection } from '../../connection';
import { IItemData, Entity } from '../../entities/entity';
import { Item } from './item';
import { RadioSet } from './radio-set';
import { Range } from './range';
import { Stepper } from './stepper';
import { ButtonGroup } from './button-group';
import { Message } from './message';
import { ENTITY_LIST_WIDTH, HISTORY_LIST_HEIGHT } from '../../constants';

export class EntityPanel extends ViewObject<blessed.Widgets.BoxElement> {
    private _foucusedItemIndex: number;

    public focus() {
        super.focus();
        this._foucusedItemIndex = 0;
        if (this._children.length) {
            this._children[0].focus();
        }
        if (this._node) {
            this._node.style.border.fg = 'white';
            this._updateView();
        }
    }

    public blur() {
        super.blur();
        if (this._node) {
            this._node.style.border.fg = 'gray';
            this._updateView();
        }
    }

    public showEntity(entity?: Entity) {
        this._clear();

        if (!this._node) {
            return;
        }

        // redraw
        if (!entity) {
            this._node.setLabel('Entity Panel');
        } else {
            this._node.setLabel(entity.name);
        }

        let top = 0;
        this._getItemData(entity).forEach(data => {
            const item = this._createItem(data);
            this.append(item);

            // set top after appended, wont work otherwise
            item.setTop(top);
            top += item.getHeight() + 2; // 2 lines gap
        });

        // try to keep foucus status
        if (this._isFocused()) {
            this._foucusedItemIndex = Math.min(this._foucusedItemIndex, this._children.length - 1);
            this._children[this._foucusedItemIndex].focus();
        }

        this._updateView();
    }

    protected _createNode(): blessed.Widgets.BoxElement {
        const box = blessed.box({
            left: 0,
            top: 0,
            right: ENTITY_LIST_WIDTH - 1,
            bottom: HISTORY_LIST_HEIGHT - 1,
            border: {
                type: 'line',
            },
            padding: {
                left: 1,
                top: 1,
            },
            style: {
                border: {
                    fg: 'gray',
                },
            },
        });

        return box;
    }

    private _getItemData(entity?: Entity): (IItemData | { type: 'message'; text: string })[] {
        if (!entity) {
            return [
                {
                    type: 'message',
                    text: 'No entity selected.',
                },
            ];
        }

        if (!entity.isAvailable()) {
            return [
                {
                    type: 'message',
                    text: 'This entity is available.',
                },
            ];
        }

        const itemData = entity.getItemData();
        if (!itemData || !itemData.length) {
            return [
                {
                    type: 'message',
                    text: 'No supported operations for this entity.',
                },
            ];
        }

        return itemData;
    }

    private _createItem(data: IItemData | { type: 'message'; text: string }): Item {
        let item: Item | undefined;
        switch (data.type) {
            case 'message':
                item = new Message(data.text);
                break;
            case 'radioSet':
                item = new RadioSet(data.label, data.value, data.options);
                item.onChange(val => {
                    const serviceParams = data.serviceParamsFun(val);
                    Connection.getInstance().callService(
                        serviceParams.domain,
                        serviceParams.service,
                        serviceParams.data,
                    );
                });
                break;
            case 'range':
                item = new Range(data.label, data.value, data.min, data.max, data.step);
                item.onChange(val => {
                    const serviceParams = data.serviceParamsFun(val);
                    Connection.getInstance().callService(
                        serviceParams.domain,
                        serviceParams.service,
                        serviceParams.data,
                    );
                });
                break;
            case 'stepper':
                item = new Stepper(data.label, data.backwardLabel, data.forwardLabel);
                item.onChange(val => {
                    const serviceParams = data.serviceParamsFun(val);
                    Connection.getInstance().callService(
                        serviceParams.domain,
                        serviceParams.service,
                        serviceParams.data,
                    );
                });
                break;
            case 'buttonGroup':
                item = new ButtonGroup(data.label, data.buttons);
                item.onChange(val => {
                    const serviceParams = data.serviceParamsFun(val);
                    Connection.getInstance().callService(
                        serviceParams.domain,
                        serviceParams.service,
                        serviceParams.data,
                    );
                });
                break;
            default:
                break;
        }

        if (!item) {
            throw new Error(`Unsupported entity type: ${data.type}`);
        }

        item.onRight(this._emitRight.bind(this));

        item.onUp(() => {
            if (this._foucusedItemIndex > 0) {
                this._children[--this._foucusedItemIndex].focus();
            }
        });

        item.onDown(() => {
            if (this._foucusedItemIndex < this._children.length - 1) {
                this._children[++this._foucusedItemIndex].focus();
            }
        });

        return item;
    }
}
