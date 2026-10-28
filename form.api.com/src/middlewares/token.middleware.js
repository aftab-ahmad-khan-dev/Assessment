import jwt from "jsonwebtoken";
import { User } from "../startup/models.js";

const tokenSecret = process.env.TOKEN_SECRET_KEY;

// Allowed URL arrays
const allowedUrls = [
  // Admin Panel URLs
  "/ap/admin/create",
  "/ap/admin/login",
  "/ap/admin/forgot-password",
  "/ap/admin/verify",
  "/ap/admin/update-password",
  "/ap/admin/send-reset-code",
  "/dp/driver/create",
  "/dp/driver/login",
  "/dp/driver/validate-user",
  "/dp/driver/forget-password",

  // Vendor panel URLs

  // Mobile App URLs
  "/ma/user/check-user",
  "/ma/user/register",
  "/ma/user/login",
  "/ma/user/social",
  "/ma/user/send-verification-code",
  "/ma/user/forgot-password",

  "/health",
];

const allowedUrlWithParams = [];

const allowedOrNotUrls = ["/"];

const allowedOrNotUrlWithParams = [];

var allowedOrNotUrlsWithParamsChecker = function (req, res, next) {
  let result = null;
  allowedOrNotUrlWithParams.forEach((element) => {
    if (element == req.url.slice(0, element.length)) {
      result = true;
    }
  });
  return result;
};

/**
 * Check if the URL matches allowed patterns with parameters.
 * @param {Object} req - Express request object.
 * @returns {boolean}
 */
const allowedUrlsWithParamsChecker = (req) => {
  return allowedUrlWithParams.some((url) => req.url.startsWith(url));
};

/**
 * Middleware to verify and decode JWT tokens.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const tokenCheckerMiddleware = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  // Check for authorization header
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No user token provided with request." });
  }

  const token = authHeader.split(" ")[1];

  // Check for token existence
  if (!token) {
    return res
      .status(401)
      .json({ message: "No user token provided with request." });
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(token, tokenSecret);

    if (!decodedToken) {
      return res
        .status(401)
        .json({ message: "Invalid token provided with the request." });
    }

    // Fetch user or admin from the database
    const admin = await Admin.findById(decodedToken._id);
    const vendorManager = await VendorManager.findById(decodedToken._id);
    const user = await User.findById(decodedToken._id);
    const driver = await Driver.findById(decodedToken._id);

    if (!admin && !user && !vendorManager && !driver) {
      return res
        .status(401)
        .json({ message: "Unable to find user information." });
    }

    if (user) {
      // Check if the user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ message: "User has been blocked!" });
      }

      // Check if the user has a deletion request
      if (user.deletionRequest) {
        return res
          .status(403)
          .json({ message: "User account is pending deletion!" });
      }
    }

    // Attach user details and role to the request object
    req.user = admin
      ? {
          ...admin.toObject(),
          role: admin?.isSuperAdmin ? "Super Admin" : "Admin",
        }
      : vendorManager
      ? { ...vendorManager.toObject(), role: "vendor" }
      : driver
      ? { ...driver.toObject(), role: "driver" }
      : { ...user.toObject(), role: user?.type || "user" };
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res
      .status(401)
      .json({ message: "Error reading token provided with the request." });
  }
};

/**
 * Middleware to verify and decode JWT tokens.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const tokenCheckerOrNotMiddleWare = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  // Check for authorization header
  if (!authHeader) {
    return next();
  }

  const token = authHeader?.split(" ")[1];

  // Check for token existence
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(token, tokenSecret);

    if (!decodedToken) {
      return next();
    }

    // Fetch user or admin from the database
    const admin = await Admin.findById(decodedToken._id);
    const user = await User.findById(decodedToken._id);

    if (!admin && !user) {
      return next();
    }

    // Attach user details and role to the request object
    req.user = admin
      ? {
          ...admin.toObject(),
          role: admin?.isSuperAdmin ? "Super Admin" : "Admin",
        }
      : { ...user.toObject(), role: user.type };

    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return next();
  }
};

/**
 * Main token-checking middleware to allow or deny access.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const tokenChecker = async (req, res, next) => {
  if (
    req.url.startsWith("/file/") ||
    allowedUrls.includes(req.url) ||
    allowedUrlsWithParamsChecker(req)
  ) {
    return next();
  }
  if (
    allowedOrNotUrls.includes(req.url) ||
    allowedOrNotUrlsWithParamsChecker(req)
  ) {
    await tokenCheckerOrNotMiddleWare(req, res, next);
    return;
  }

  await tokenCheckerMiddleware(req, res, next);
};
