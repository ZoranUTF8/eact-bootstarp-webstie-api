const { StatusCodes } = require("http-status-codes");

const MONGOOSE_DUPLICATE_KEY_ERROR_CODE = 11000;
const MONGOOSE_VALIDATION_ERROR = "ValidationError";
const MONGOOSE_CAST_ERROR = "CastError";

const errorHandlerMiddleware = (err, req, res, next) => {
  // custom error
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong",
  };

  // If error from mongoose make more user friendly error message
  if (err.name === MONGOOSE_VALIDATION_ERROR) {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  // Duplicate register value
  if (err.code && err.code === MONGOOSE_DUPLICATE_KEY_ERROR_CODE) {
    (customError.msg = `That value has already been used > ${Object.entries(
      err.keyValue
    )}. Please use a different value.`),
      (customError.statusCode = StatusCodes.BAD_REQUEST);
  }

  // Wrong format of request value
  if (err.name === MONGOOSE_CAST_ERROR) {
    customError.msg = `No item found for the provided item id of > ${err.value}. Check your input.`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // Send the error message
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
