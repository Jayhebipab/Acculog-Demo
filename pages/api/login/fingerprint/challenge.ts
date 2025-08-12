import { NextApiRequest, NextApiResponse } from "next";
import base64url from "base64url";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { Email } = req.body;
  if (!Email) return res.status(400).json({ error: "Email is required" });

  try {
    const db = await connectToDatabase();
    const users = db.collection("users");

    // Find user by Email
    const user = await users.findOne({ Email });
    if (!user || !user.FingerprintKey) {
      return res.status(404).json({ error: "User or fingerprint key not found" });
    }

    // Generate random challenge (32 bytes)
    const challenge = base64url(crypto.randomBytes(32));

    // You should save this challenge server-side (session, DB, cache) tied to the user to verify later
    // For simplicity, let's just send it back here and let client send it back for verification

    // Construct PublicKeyCredentialRequestOptions
    const options = {
      challenge,
      timeout: 60000,
      rpId: "your-domain.com", // replace with your actual domain
      allowCredentials: [
        {
          id: base64url.toBuffer(user.FingerprintKey),
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "preferred",
    };

    // TODO: Save the challenge tied to the user in DB/session for verification later

    res.status(200).json(options);
  } catch (error) {
    console.error("Error generating fingerprint challenge:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
