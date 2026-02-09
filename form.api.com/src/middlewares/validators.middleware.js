import { StatusCodes } from "http-status-codes";
import { validationResult, body, param, query } from "express-validator";
import { generateApiResponse, badWordsCheck } from "../services/utilities.service.js";

/**
 * Validation functions for various attributes
 */
const validators = {
    password: (attr) =>
        body(attr)
            .trim()
            .notEmpty().withMessage("Password is required.")
            .bail()
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),

    name: (attr) =>
        body(attr)
            .trim()
            .notEmpty().withMessage("Name is required.")
            .bail()
            .custom((value) => {
                if (badWordsCheck(value)) {
                    throw new Error("Name contains inappropriate language.");
                }
                return true;
            }),

    email: (attr) =>
        body(attr)
            .trim()
            .notEmpty().withMessage("Email is required.")
            .bail()
            .isEmail().withMessage("Email must be a valid email address."),

    generic: (attr, type) => {
        const validator =
            type === "body" ? body(attr) : type === "query" ? query(attr) : param(attr);
        return validator
            .trim()
            .notEmpty().withMessage(`${attr} is required.`);
    },
};

/**
 * Validate API attributes based on specified requirements
 * @param {string[]} attributes - Attributes to validate
 * @param {'body'|'param'|'query'} type - Validation type (body, param, or query)
 * @param {string[]} validationArray - Specific validations to apply, e.g., ['password', 'email']
 * @returns {Array} Array of validation rules
 */
export const validateApiAttributes = (attributes, type = "body", validationArray = []) => {
    return attributes.map((attr) => {
        if (validationArray.includes(attr) && validators[attr]) {
            return validators[attr](attr);
        }
        return validators.generic(attr, type);
    });
};

/**
 * Middleware for checking validation errors in API requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const checkApiValidation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((err) => err.msg);
        return generateApiResponse(
            res,
            StatusCodes.BAD_REQUEST,
            false,
            validationErrors[0],
            { error: validationErrors }
        );
    }
    next();
};

/**
 * Middleware to normalize phone numbers to international format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const normalizePhoneNumber = (req, res, next) => {
    if (req.body.phone) {
        req.body.phone = req.body.phone.startsWith("+")
            ? req.body.phone
            : `+${req.body.phone}`;
    }
    next();
};
