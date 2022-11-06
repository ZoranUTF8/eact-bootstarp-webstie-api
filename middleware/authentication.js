const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const auth = async (req, res, next) => {
  // Check request header for the jwt token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Invalid token");
  }

  //   extract the token from the authorization
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
  
    // attach the verified user to the employee routes
    req.user = { userId: payload.UserId, userName: payload.name };
    // pass on the to the next middleware
    next();
  } catch (err) {
    throw new UnauthenticatedError("Invalid token");
  }
};

module.exports = auth;
