import { getEta } from "./src/services/getETA.js ";


const position1 = { latitude: 33.6844, longitude: 73.0479 };  // Example: Islamabad
const position2 = { latitude: 24.8607, longitude: 67.0011 };  // Example: Karachi

async function testGetEta() {
    const etaInSeconds = await getEta(position1, position2);

    if (etaInSeconds !== null) {
        console.log(`ETA between position1 and position2 is approximately ${etaInSeconds} seconds.`);
        console.log(`That's about ${(etaInSeconds / 60).toFixed(2)} minutes.`);
    } else {
        console.log("Failed to get ETA.");
    }
}

testGetEta();
