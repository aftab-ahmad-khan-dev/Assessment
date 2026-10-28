import bcryptjs from 'bcryptjs';

/**
 * Encrypt password
 * @param {*} password 
 * @returns 
 */
export async function encryptPassword(password) {
    const encryptedPassword = await bcryptjs.hash(password, 12);
    return encryptedPassword;
}

/**
 * Compare encrypted password
 * @param {*} password 
 * @param {*} encryptedPassword 
 * @returns 
 */
export async function compareEncryptedPassword(password, encryptedPassword) {
    const isMatched = await bcryptjs.compare(password, encryptedPassword);
    return isMatched;
}
