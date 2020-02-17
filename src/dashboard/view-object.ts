/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-08 20:27
#
# Description:
#
=============================================================================*/

import { EventEmitter } from 'events';
import * as blessed from 'blessed';

export abstract class ViewObject<T extends blessed.Widgets.Node = blessed.Widgets.Node> extends EventEmitter {
    protected _node: T;

    protected readonly _children: ViewObject[] = [];

    private _parent?: ViewObject;

    private _focused?: ViewObject; // current focused child

    public render(parentNode?: blessed.Widgets.Node) {
        this._node = this._createNode();
        if (parentNode) {
            parentNode.append(this._node);
        }
        this._updateView();
    }

    public append(child: ViewObject) {
        child.render(this._node);

        // when the child need to be updated, update ourself
        child.on('update', this._updateView.bind(this));

        this._children.push(child);

        // eslint-disable-next-line no-param-reassign
        child._parent = this;
    }

    public focus() {
        if (this._isFocused()) {
            return;
        }

        if (this._parent!._focused) {
            this._parent!._focused.blur();
        }

        // set parent's focused first
        // some object may check this in its focus or blur function
        this._parent!._focused = this;

        const node = this._node as any;
        if (node && node.focus instanceof Function) {
            node.focus();
        }
    }

    public blur() {
        if (this._focused) {
            this._focused.blur();
            delete this._focused;
        }
    }

    // for key 'left arrow' & 'h'
    public onLeft(listener: () => void) {
        this.on('left', listener);
    }

    // for key 'right arrow' & 'l'
    public onRight(listener: () => void) {
        this.on('right', listener);
    }

    // for key 'up arrow' & 'k'
    public onUp(listener: () => void) {
        this.on('up', listener);
    }

    // for key 'down arrow' & 'j'
    public onDown(listener: () => void) {
        this.on('down', listener);
    }

    public destroy() {
        this._clear();
        if (this._node) {
            this._node.destroy();
            delete this._node;
        }
    }

    protected _isFocused(): boolean {
        return !!this._parent && this._parent._focused === this;
    }

    protected _emitLeft() {
        this.emit('left');
    }

    protected _emitRight() {
        this.emit('right');
    }

    protected _emitUp() {
        this.emit('up');
    }

    protected _emitDown() {
        this.emit('down');
    }

    protected _bindLeft(node: blessed.Widgets.BoxElement, listener: () => void) {
        node.key(['left', 'h'], listener);
    }

    protected _bindRight(node: blessed.Widgets.BoxElement, listener: () => void) {
        node.key(['right', 'l'], listener);
    }

    protected _bindUp(node: blessed.Widgets.BoxElement, listener: () => void) {
        node.key(['up', 'k'], listener);
    }

    protected _bindDown(node: blessed.Widgets.BoxElement, listener: () => void) {
        node.key(['down', 'j'], listener);
    }

    protected _bindShiftKes(node: blessed.Widgets.BoxElement) {
        node.key(['S-left', 'S-h'], this._emitLeft.bind(this));

        node.key(['S-right', 'S-l'], this._emitRight.bind(this));

        node.key(['S-up', 'k'], this._emitUp.bind(this));

        node.key(['S-down', 'S-j'], this._emitDown.bind(this));
    }

    // destroy all children
    protected _clear() {
        for (const child of this._children) {
            child.destroy();
        }
        this._children.length = 0;
    }

    // call it when need to be updated
    protected _updateView() {
        this.emit('update');
    }

    protected abstract _createNode(): T;
}
