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

    // TODO: Save challenge tied to user in DB or session for verification later

    // Construct PublicKeyCredentialRequestOptions
    const options = {
      challenge,
      timeout: 60000,
      rpId: "localhost", // <-- dito na naka localhost para testing sa local dev environment
      allowCredentials: [
        {
          id: base64url.toBuffer(user.FingerprintKey),
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "preferred",
    };

    res.status(200).json(options);
  } catch (error) {
    console.error("Error generating fingerprint challenge:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
