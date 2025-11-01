// // lib/setup-db.ts
// import clientPromise from "./mongodb";

// export async function setupDatabase() {
//   try {
//     const client = await clientPromise;
//     const db = client.db();

//     // Create TTL index for automatic cleanup of expired tokens
//     await db.collection("passwordResetTokens").createIndex({ expires: 1 }, { expireAfterSeconds: 0 });

//     console.log("✅ Database indexes created successfully");
//   } catch (error) {
//     console.error("❌ Database setup error:", error);
//   }
// }
