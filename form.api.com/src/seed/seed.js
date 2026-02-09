import mongoose from 'mongoose';
import fs from 'fs';
// import path from 'path';

import {
    Admin,
    Config,
    User,
} from '../startup/models.js';

const adminJson = JSON.parse(fs.readFileSync('src/seed/exports/admins.json', 'utf8'));
const configJson = JSON.parse(fs.readFileSync('src/seed/exports/configs.json', 'utf-8'));
const userJson = JSON.parse(fs.readFileSync('src/seed/exports/users.json', 'utf8'));

const seedAllNow = async () => {
    console.log("Dropping database...");

    // Dropping collections
    await mongoose.connection.dropCollection('admins');
    await mongoose.connection.dropCollection('configs');
    await mongoose.connection.dropCollection('users');

    // Inserting data into collections
    // console.log(config);

    await Admin.insertMany(adminJson);
    console.log("Admins inserted...");
    await Config.insertMany(configJson);
    console.log("Configs inserted...");
    await User.insertMany(userJson);
    console.log("Users inserted...");

    console.log('Database has been created and initial data has been added...');
    process.exit();
}

seedAllNow();
