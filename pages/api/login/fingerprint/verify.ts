import { NextApiRequest, NextApiResponse } from "next";
import base64url from "base64url";
import { connectToDatabase } from "@/lib/MongoDB";
// You may want to use a WebAuthn verification library like '@simplewebauthn/server'
// For demonstration, this is a simplified pseudo-verification

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { Email, credential } = req.body;

  if (!Email || !credential) {
    return res.status(400).json({ error: "Email and credential are required" });
  }

  try {
    const db = await connectToDatabase();
    const users = db.collection("users");

    // Find user by Email
    const user = await users.findOne({ Email });
    if (!user || !user.FingerprintKey) {
      return res.status(404).json({ error: "User or fingerprint key not found" });
    }

    // TODO: Retrieve the saved challenge from DB/session to verify

    // TODO: Verify the assertion response using the stored public key (user.FingerprintKey)
    // This is complex and involves cryptographic checks; libraries like '@simplewebauthn/server' help here.

    // For demonstration, let's assume verification passed if credential.id === user.FingerprintKey
    if (credential.id !== user.FingerprintKey) {
      return res.status(401).json({ error: "Invalid credential" });
    }

    // If verification succeeds:
    res.status(200).json({ userId: user._id.toString(), message: "Fingerprint login successful" });
  } catch (error) {
    console.error("Error verifying fingerprint login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
