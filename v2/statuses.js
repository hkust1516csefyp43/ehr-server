module.exports = {
  // Successful (2XX)
  inserted: function () {
    return 201;
  },
  updated: function () {
    return 202;
  },
  removed: function () {
    return 203;
  },
  // It's your fault (4XX)
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
  device_id_blocked: function() {
    return 450;
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
  // It's my fault (5XX)
  server_error: function () {
    return 500;
  },
  server_unavailable: function () {
    return 503;
  }
};