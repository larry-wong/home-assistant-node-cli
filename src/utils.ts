/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-05 14:50
#
# Description:
#
=============================================================================*/

import * as chalk from 'chalk';

export function debounce(fun: () => void, duration: number): () => Promise<void> {
    let timeoutHandler: NodeJS.Timeout;
    let isPending: boolean;
    let rejectPromise: () => void;

    async function delay() {
        // cancel last request which is already waiting
        if (isPending) {
            clearTimeout(timeoutHandler);
            rejectPromise();
        }

        // start a new timeout
        return new Promise((resolve, reject) => {
            rejectPromise = reject;
            isPending = true;
            timeoutHandler = setTimeout(() => {
                resolve();
                isPending = false;
            }, duration);
        });
    }

    return async () => {
        try {
            await delay();
            await fun();
        } catch (e) {
            // No Implemention
        }
    };
}

export function showError(msg: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.red(msg));
}
