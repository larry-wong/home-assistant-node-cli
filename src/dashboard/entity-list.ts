/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-02 20:13
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { ViewObject } from './view-object';
import { Connection } from '../connection';
import { createEntity } from '../entities';
import { Entity } from '../entities/entity';
import { ENTITY_LIST_WIDTH } from '../constants';

export class EntityList extends ViewObject<blessed.Widgets.ListElement> {
    /*
      --------------------------------------------------------------------
      | border | padding | device name | gap | status | padding | border |
      --------------------------------------------------------------------
      total = DEVICE_LIST_WIDTH
      padding = 1
      gap >= 2
    */
    private static _entity2Text(entity: Entity, index: number, strWidth: (str: string) => number): string {
        const maxNameLength = ENTITY_LIST_WIDTH - entity.state.length - 6;
        let displayName = entity.name;
        let displayNameWidth = strWidth(displayName);
        while (displayNameWidth > maxNameLength) {
            displayName = displayName.substr(0, displayName.length - 1);
            displayNameWidth = strWidth(displayName);
        }
        const gap = 2 + maxNameLength - displayNameWidth;

        let res = ` ${displayName}${new Array(gap + 1).join(' ')}${entity.state} `;
        if (index & 1) {
            res = `{#111111-bg}${res}{/}`;
        }
        return res;
    }

    public focus() {
        if (this._node) {
            this._node.focus();
            this._node.style.border.fg = 'white';
            this._updateView();
        }
    }

    public blur() {
        if (this._node) {
            this._node.style.border.fg = 'gray';
            this._updateView();
        }
    }

    public onSelect(listener: (entity?: Entity) => void) {
        this.on('select', listener);
    }

    protected _createNode(): blessed.Widgets.ListElement {
        let entities: Entity[];
        let selected = 0;

        // save position of first entity of each type for searching
        const indexesOfEachType: number[] = [];

        function generateIndexes() {
            indexesOfEachType.length = 0;
            let type = '';
            entities.forEach((entity, index) => {
                if (entity.type !== type) {
                    indexesOfEachType.push(index);
                    type = entity.type;
                }
            });
        }

        const list = blessed.list({
            label: 'Entities',
            width: ENTITY_LIST_WIDTH,
            right: 0,
            top: 0,
            bottom: 0,
            border: {
                type: 'line',
            },
            style: {
                selected: {
                    inverse: true,
                },
                border: {
                    fg: 'gray',
                },
            } as any,
            keys: true,
            vi: true,
            tags: true,

            // jump to the start of next type when '/' key is hit
            search: () => {
                const to = indexesOfEachType.find(i => i > selected) || indexesOfEachType[0];
                list.select(to);
                this._updateView();
            },
        });

        // toggle the entity when space key is hit
        list.key('space', () => {
            const entity = entities[selected];
            if (entity.supportToggle) {
                const toggleParams = entity.getToggleServiceParams();
                Connection.getInstance().callService(toggleParams.domain, toggleParams.service, toggleParams.data);
            }
        });

        this._bindLeft(list, this._emitLeft.bind(this));

        this._bindShiftKes(list);

        list.on('keypress', () => {
            const currentSelected = (list as any).selected; // seems to be an inner attr
            if (selected === currentSelected) {
                return;
            }
            selected = currentSelected;
            this.emit('select', entities[selected]);
        });

        Connection.getInstance().subscribeEntities(_entities => {
            entities = _entities.map(en => createEntity(en)).filter(en => en.isVisible());
            generateIndexes();
            const items = entities.map(
                (entity, i) => EntityList._entity2Text(entity, i, list.strWidth.bind(list) as any) as any,
            );
            list.setItems(items);

            // in case some entities are removed & selected is out of range
            // blessed list will select the last item in this case
            selected = Math.min(selected, entities.length - 1);

            this._updateView();
            this.emit('select', entities[selected]);
        });

        return list;
    }
}
