import jwt from "jsonwebtoken";

const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

if (!tokenSecret) {
  throw new Error("ACCESS_TOKEN_SECRET is missing in .env file");
}

/**
 * Generate JWT token
 */
export const tokenCreator = (payload) => {
  return jwt.sign(payload, tokenSecret, { expiresIn: "7d" });
};

/**
 * Verify JWT token
 */
export const tokenVerifier = (token) => {
  return jwt.verify(token, tokenSecret);
};
