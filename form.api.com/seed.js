import mongoose from "mongoose";
import { Vendor } from "./src/startup/models.js";

const centerLat = 31.3810571;
const centerLng = 73.06295;
const radiusInKm = 5;

// Haversine formula approximation to generate nearby lat/lng
function generateNearbyCoordinates(lat, lng, radiusKm) {
    const r = radiusKm / 111.32; // ~1 degree = 111.32 km
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const deltaLat = w * Math.cos(t);
    const deltaLng = w * Math.sin(t) / Math.cos(lat * (Math.PI / 180));
    return {
        latitude: lat + deltaLat,
        longitude: lng + deltaLng,
    };
}

async function updateVendorsWithNearbyLocations() {
    try {
        await mongoose.connect("mongodb+srv://nextlevelsoftwaretesting:yAUh61uwVT7sWxa0@nlstesting.ocn6l.mongodb.net/connectdev", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const vendors = await Vendor.find({});

        for (const vendor of vendors) {
            const coords = generateNearbyCoordinates(centerLat, centerLng, radiusInKm);
            vendor.location.latitude = coords.latitude;
            vendor.location.longitude = coords.longitude;
            await vendor.save();
            console.log(`Updated vendor ${vendor._id} with new location.`);
        }

        console.log("All vendors updated with new nearby coordinates.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating vendors:", error);
        process.exit(1);
    }
}

updateVendorsWithNearbyLocations();
