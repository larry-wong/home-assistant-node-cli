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

import { Account } from './account';
import { Dashboard } from './dashboard';

(async () => {
    // sign to hass with configuration file or user input
    await Account.getInstance().signIn();

    // render the dashboard
    new Dashboard().render();
})();
