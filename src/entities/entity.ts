/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-06 14:58
#
# Description:
#
=============================================================================*/

import { HassEntity } from 'home-assistant-js-websocket';

export interface IServiceParams {
    domain: string;
    service: string;
    data: object;
}

interface IItemBaseData<T> {
    type: string;
    label: string;
    serviceParamsFun: (val: T) => IServiceParams;
}

interface IRadioSetData extends IItemBaseData<string> {
    type: 'radioSet';
    value: string;
    options: string[];
}

interface IRangeData extends IItemBaseData<number> {
    type: 'range';
    value: number;
    min: number;
    max: number;
    step: number;
}

interface IStepperData extends IItemBaseData<boolean> {
    type: 'stepper';
    backwardLabel: string;
    forwardLabel: string;
}

interface IButtonGroupData extends IItemBaseData<number> {
    type: 'buttonGroup';
    buttons: string[];
}

export type IItemData = IRadioSetData | IRangeData | IStepperData | IButtonGroupData;

export class Entity {
    public static FILTER_REG = /.*/; // to test entity_id

    protected _data: HassEntity;

    constructor(data: HassEntity) {
        this._data = data;
    }

    // entity type: light, climate etc.
    public get type(): string {
        return this._data.entity_id.split('.')[0];
    }

    // prefer friendly_name over id
    public get name(): string {
        return this._data.attributes.friendly_name || this._data.entity_id;
    }

    // state displayed in entity list: hass state + unit_of_measurement
    public get state(): string {
        return this._data.state + (this._data.attributes.unit_of_measurement || '');
    }

    // time displayed in history list
    public get lastUpdated(): string {
        return new Date(this._data.last_updated).toLocaleString();
    }

    // state dispalyed in history list
    public get historyState(): string {
        return this.state;
    }

    // visible in device list
    public isVisible(): boolean {
        return !this._data.attributes.hidden;
    }

    public isAvailable(): boolean {
        return this._data.state !== 'unavailable';
    }

    // whether this entity support toogle action in device list
    // some entities may not support toggle, such as sernors
    public get supportToggle(): boolean {
        return this.isAvailable();
    }

    // how to toggle if supported
    public getToggleServiceParams(): IServiceParams {
        return {
            domain: 'homeassistant',
            service: 'toggle',
            data: {
                entity_id: this._data.entity_id,
            },
        };
    }

    // items dispalyed in entityPanel
    public getItemData(): IItemData[] {
        return [];
    }

    // supported feature flag
    protected get _supportedFeatures(): number {
        return this._data.attributes.supported_features || 0;
    }
}
