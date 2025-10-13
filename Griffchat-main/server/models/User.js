// import bcrypt from "bcryptjs";
// import { db } from "../server.js";
// import { ObjectId } from "mongodb";

// // Get the users collection
// export const Users = () => db.collection("users");

// // Create a new user (with hashed password)
// export async function createUser({ name, email, password, role = "User" }) {
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   const result = await Users().insertOne({
//     name,
//     email: email.toLowerCase(), // normalize email
//     password: hashedPassword,
//     role,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   return result.insertedId;
// }

// // Find user by email
// export async function findUserByEmail(email) {
//   return await Users().findOne({ email: email.toLowerCase() });
// }

// // Find user by ID (exclude password)
// export async function findUserById(id) {
//   if (!ObjectId.isValid(id)) return null;

//   return await Users().findOne(
//     { _id: new ObjectId(id) },
//     { projection: { password: 0 } }
//   );
// }

// // Compare password
// export async function matchPassword(enteredPassword, hashedPassword) {
//   return await bcrypt.compare(enteredPassword, hashedPassword);
// }

// // Update user (example: profile update)
// export async function updateUser(id, updates) {
//   if (!ObjectId.isValid(id)) return null;

//   updates.updatedAt = new Date();

//   const result = await Users().findOneAndUpdate(
//     { _id: new ObjectId(id) },
//     { $set: updates },
//     { returnDocument: "after", projection: { password: 0 } }
//   );

//   return result.value;
// }


import bcrypt from "bcryptjs";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

export const Users = () => getDB().collection("users");

export async function createUser({ name, email, password, role = "User" }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await Users().insertOne({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return result.insertedId;
}

export async function findUserByEmail(email) {
  return await Users().findOne({ email: email.toLowerCase() });
}

export async function matchPassword(enteredPassword, hashedPassword) {
  return await bcrypt.compare(enteredPassword, hashedPassword);
}

export async function findUserById(id) {
  if (!ObjectId.isValid(id)) return null;

  return await Users().findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );
}

export async function updateUser(id, updates) {
  if (!ObjectId.isValid(id)) return null;

  updates.updatedAt = new Date();

  const result = await Users().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after", projection: { password: 0 } }
  );

  return result.value;
}
