module.exports = {
  just_error: function () {
    return 400;
  },
  no_permission: function () {
    return 403;
  },
  not_found: function () {
    return 404;
  },
  token_does_not_exist: function() {
    return 497;
  },
  token_expired: function() {
    return 498;
  },
  token_missing: function () {
    return 499;
  },
  server_unavailable: function () {
    return 503;
  },
  access_token_expired: function() {
    return 419;
  }
};