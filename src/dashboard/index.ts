/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-02 20:06
#
# Description:
#
=============================================================================*/

import * as blessed from 'blessed';
import { ViewObject } from './view-object';
import { EntityList } from './entity-list';
import { EntityPanel } from './entity-panel';
import { HistoryList } from './history-list';

export class Dashboard extends ViewObject<blessed.Widgets.Screen> {
    public render() {
        super.render();

        const entityPanel = new EntityPanel();
        this.append(entityPanel);

        const historyList = new HistoryList();
        this.append(historyList);

        const entityList = new EntityList();
        this.append(entityList);
        entityList.focus();

        // transfer data / events between entityList & entityPanel
        entityList.onSelect(entityPanel.showEntity.bind(entityPanel));
        entityList.onLeft(entityPanel.focus.bind(entityPanel));
        entityPanel.onRight(entityList.focus.bind(entityList));
    }

    protected _createNode(): blessed.Widgets.Screen {
        const screen = blessed.screen({
            smartCSR: true,
            fullUnicode: true,
        });
        screen.title = 'Home Assistant';
        screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

        let updateFlag = false;
        this.on('update', () => {
            if (updateFlag) {
                return;
            }
            updateFlag = true;
            process.nextTick(() => {
                screen.render();
                updateFlag = false;
            });
        });

        return screen;
    }

    protected _isFocused() {
        return true; // root object is always focused
    }
}
