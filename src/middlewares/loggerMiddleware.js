const morgan = require("morgan");

const loggerMiddleware = morgan("combined");

module.exports = loggerMiddleware;
