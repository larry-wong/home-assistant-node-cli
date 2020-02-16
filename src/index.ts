/*=============================================================================
#
# Copyright (C) 2020 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2020-02-01 14:52
#
# Description:
#
=============================================================================*/

import { HassInfo } from './hass-info';
import { Connection } from './connection';
import { Dashboard } from './dashboard';

(async () => {
    // get hass info from configuration file or user input
    const hassInfo = await HassInfo.getInstance().getInfo();

    // create connection to hass with that info
    await Connection.getInstance().connect(hassInfo.hassUrl, hassInfo.token);

    // render the dashboard
    new Dashboard().render();
})();
