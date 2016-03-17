module.exports = {
  bad_request: function () {
    return 400;
  },
  no_permission: function () {
    return 403;
  },
  not_found: function () {
    return 404;
  },
  refresh_token_expired: function () {
    return 440;
  },
  token_does_not_exist: function () {
    return 497;
  },
  access_token_expired: function () {
    return 498;
  },
  token_missing: function () {
    return 499;
  },
  token_missing_message: function () {
    return 'Token is missing';
  },
  server_error: function () {
    return 500;
  },
  server_unavailable: function () {
    return 503;
  },
  refresh_token_expired: function () {
    return 419;
  }
};