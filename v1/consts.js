module.exports = {
  just_error: function () {
    "use strict";
    return 400;
  },
  no_permission: function () {
    "use strict";
    return 403;
  },
  token_missing: function () {
    "use strict";
    return 499;
  }
};