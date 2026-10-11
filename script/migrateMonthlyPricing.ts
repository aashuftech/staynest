import "dotenv/config";
import mongoose from "mongoose";

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  const properties = mongoose.connection.collection("properties");

  // Existing listings are retained. Their monthly value is preserved and the
  // old nightly field is removed from every document.
  await properties.updateMany(
    { pricePerMonth: { $exists: false }, pricePerNight: { $exists: true } },
    [{ $set: { pricePerMonth: { $multiply: ["$pricePerNight", 30] } } }],
  );
  await properties.updateMany({}, { $unset: { pricePerNight: "" } });
  await mongoose.disconnect();
  console.log("Monthly pricing migration complete.");
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
