module.exports = {
  just_error: function () {
    "use strict";
    return 400;
  },
  no_permission: function () {
    "use strict";
    return 403;
  },
  token_does_not_exist: function() {
    "use strict";
    return 497;
  },
  token_expired: function() {
    "use strict";
    return 498;
  },
  token_missing: function () {
    "use strict";
    return 499;
  }
};