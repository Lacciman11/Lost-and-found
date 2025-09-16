const helmet = require("helmet");

const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // disable CSP if serving frontend separately
});

module.exports = helmetMiddleware;
