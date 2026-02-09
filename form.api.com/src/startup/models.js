import connectDatabase from "../database/database.js";
import Record from "../models/record.model.js";

// Connect to the database
connectDatabase();

// Export as named exports
export { Record };
