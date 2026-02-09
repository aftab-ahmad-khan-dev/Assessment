import moment from "moment";

/**
 * Generate start end date statement
 * @param {*} reqQuery 
 * @returns 
 */
export function generateStartEndDateStatement(reqQuery, attribute = 'createdAt') {
    const { startDate = null, endDate = null } = reqQuery;
    if (!startDate && !endDate) {
        return {};
    }
    const query = {};
    if (startDate) {
        const startDateFormatted = moment(startDate).startOf('day');
        query[attribute] = { ...query[attribute], $gte: startDateFormatted };
    }
    if (endDate) {
        const endDateFormatted = moment(endDate).endOf('day');
        query[attribute] = { ...query[attribute], $lte: endDateFormatted };
    }
    return query;
}


/**
 * Generate a random string or number based on specified criteria
 * @param {number} length - Desired length of the output
 * @param {'alphanumeric' | 'alphabetic' | 'numeric'} charset - Type of characters to include
 * @param {boolean} [isCapital=true] - Whether to use uppercase letters (applies to alphabetic or alphanumeric)
 * @returns {string | number} - Generated random string or number
 */
export function randomStringGenerator(length, charset, isCapital = true) {
    // Define character sets
    const charSets = {
        alphanumeric: 'abcdefghijklmnopqrstuvwxyz0123456789',
        alphabetic: 'abcdefghijklmnopqrstuvwxyz',
        numeric: '0123456789',
    };

    // Validate charset input
    if (!charSets[charset]) {
        throw new Error('Invalid charset specified. Use "alphanumeric", "alphabetic", or "numeric".');
    }

    // Select appropriate character set and handle capitalization
    const characters = isCapital
        ? charSets[charset].toUpperCase()
        : charSets[charset];

    // Generate random string
    let randomValue = Array.from({ length }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');

    // Ensure numeric strings don't start with "0" if length > 1
    if (charset === 'numeric' && randomValue.startsWith('0') && length > 1) {
        randomValue = randomValue.replace(/^0/, characters.charAt(1 + Math.floor(Math.random() * 9)));
    }

    // Return as a number if charset is numeric
    return charset === 'numeric' ? Number(randomValue) : randomValue;
}



/**
 * Generate api response
 * @param {*} res 
 * @param {number} statusCode 
 * @param {boolean} isSuccess 
 * @param {string} message 
 * @param {*} data 
 * @returns 
 */
export async function generateApiResponse(res, statusCode, isSuccess, message, data) {
    return res.status(statusCode).json({
        statusCode: statusCode,
        // isSuccess: (statusCode >= 200 && statusCode <= 299) ? true : false,
        isSuccess: isSuccess,
        message: message,
        ...data,
    });
};

/**
 * Generate API response with formatted API path
 * @param {*} res 
 * @param {string} message 
 * @param {*} data 
 * @returns 
 */
export async function generateErrorApiResponse(res, data) {
    const apiPath = res.req.originalUrl; // Full API path

    // Extract the last static segment by splitting and filtering dynamic parts
    const pathSegments = apiPath.split('?')[0].split('/').filter(Boolean); // Remove query params and empty segments
    const lastStaticSegment = pathSegments.reverse().find(segment => !segment.startsWith(':') && isNaN(segment)) || 'unknown';

    // Format: Replace hyphens with spaces and capitalize each word
    const formattedSegment = lastStaticSegment
        .replace(/-/g, ' ') // Replace hyphens with spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word

    console.log(`Error in API: ${formattedSegment}`); // Log the formatted API name

    return res.status(500).json({
        statusCode: 500,
        isSuccess: false,
        message: "Error occurred while " + formattedSegment.toLowerCase(),
        ...data,
    });
}

/**
 * Generate random username
 * @param {string} name 
 * @returns 
 */
export function generateUsername(name) {
    const baseName = name.toLowerCase().replace(/\s+/g, '');
    const randomNum = randomStringGenerator(4, 'numeric');
    const username = `${baseName}${randomNum}`;
    return username;
}


const abusiveWords = [
    'bastard',
    'crap',
    'shit',
    'shit eater',
    'prostitute',
    'bitch',
    'dick',
    'dickless',
    'spine',
    'spineless',
    'scumbag',
    'asshole',
    'douchebag',
    'idiot',
    'moron',
    'jerk',
    'prick',
    'slut',
    'whore',
    'dumbass',
    'retard',
    'loser',
    'freak',
    'nutjob',
    'psycho',
    'pervert',
    'sicko',
    'twat',
    'wanker',
    'arsehole',
    'motherfucker',
    'cunt',
    'bastards',
    'ass',
    'asshat',
    'asswipe',
    'bastardize',
    'butthead',
    'clown',
    'cock',
    'dickhead',
    'dumb',
    'fool',
    'git',
    'jackass',
    'jerkoff',
    'knob',
    'knobhead',
    'meathead',
    'minger',
    'muppet',
    'numbnuts',
    'pillock',
    'plonker',
    'scrote',
    'tosser',
    'wally',
    'airhead',
    'bimbo',
    'blockhead',
    'bonehead',
    'chump',
    'cretin',
    'dimwit',
    'dolt',
    'dope',
    'dork',
    'dunce',
    'fatso',
    'geek',
    'halfwit',
    'imbecile',
    'lardass',
    'lunkhead',
    'meatball',
    'moran',
    'numbskull',
    'oaf',
    'peabrain',
    'pinhead',
    'schmuck',
    'simpleton',
    'thicko',
    'twit',
    'twithead',
    'twathead',
];

/**
 * Check bad words in name
 * @param {string} name 
 * @returns 
 */
export function badWordsCheck(name) {
    const lowerCaseWords = name.toLowerCase().split(' ');
    return lowerCaseWords.some((word) => abusiveWords.includes(word));
}

/**
 * Check if the email is valid
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function separatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        return {
            countryCode: "",
            number: "",
        };
    }

    // Improved regular expression
    const regex = /^\+?(\d{1,3})(\d{6,14})$/; // Country code 1-3 digits, number 6-14 digits

    const match = phoneNumber.match(regex);

    if (match) {
        return {
            countryCode: match[1],
            number: match[2]
        };
    }

    return {
        countryCode: "",
        number: ""
    };
}



export function separateName(fullName) {
    if (!fullName || fullName.trim() === "") {
        return {
            firstName: "",
            middleName: "",
            lastName: "",
        };
    }

    // Split the name by spaces
    const nameParts = fullName.trim().split(/\s+/);

    // Handle cases based on the number of parts
    if (nameParts.length === 1) {
        return {
            firstName: nameParts[0],
            middleName: "",
            lastName: "",
        };
    } else if (nameParts.length === 2) {
        return {
            firstName: nameParts[0],
            middleName: "",
            lastName: nameParts[1],
        };
    } else {
        return {
            firstName: nameParts[0],
            middleName: nameParts.slice(1, -1).join(" "),
            lastName: nameParts[nameParts.length - 1],
        };
    }
}
