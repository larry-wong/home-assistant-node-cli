/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:   Larry Wang
#
# Created:  2020-02-02 21:45
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { ViewObject } from './view-object';
import { Connection } from '../connection';
import { createEntity } from '../entities';
import { Entity } from '../entities/entity';
import { HISTORY_LIST_HEIGHT } from '../constants';

export class HistoryList extends ViewObject<blessed.Widgets.ListElement> {
    private static _history2Text(history: Entity): string {
        return (
            '{gray-fg}' +
            ' ' +
            `[${history.lastUpdated}]` +
            ' ' +
            `{white-fg}${history.name}{/white-fg}` +
            ' changed state to ' +
            `{green-fg}${history.historyState}{/green-fg}` +
            '{/}'
        );
    }

    public focus() {
        // No Implemention
    }

    public blur() {
        // No Implemention
    }

    protected _createNode(): blessed.Widgets.ListElement {
        const list = blessed.list({
            label: 'History',
            left: 0,
            top: `100%-${HISTORY_LIST_HEIGHT}`,
            right: 59,
            bottom: 0,
            border: {
                type: 'line',
            },
            tags: true,
            interactive: false,
            style: {
                border: {
                    fg: 'gray',
                },
            } as any,
        });

        Connection.getInstance().subscribeHistory(history => {
            const items = history
                // only display last (HISTORY_LIST_HEIGHT - 2) items
                .slice(Math.max(history.length - (HISTORY_LIST_HEIGHT - 2), 0))
                .map(h => HistoryList._history2Text(createEntity(h)) as any);
            list.setItems(items);
            this._updateView();
        });

        return list;
    }
}
