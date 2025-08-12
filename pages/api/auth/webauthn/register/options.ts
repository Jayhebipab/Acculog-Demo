import { NextApiRequest, NextApiResponse } from "next";
import base64url from "base64url";
import { randomBytes } from "crypto";  // <-- import here

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  // Generate a random challenge (must be cryptographically random)
  const challenge = base64url(randomBytes(32)); // use randomBytes here

  // User info (fetch from DB or similar)
  const user = {
    id: base64url(userId), // user id in bytes (base64url)
    name: userId, // or email
    displayName: "User Display Name",
  };

  const options = {
    challenge,
    rp: { name: "Acculog" },
    user,
    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256 algorithm
    timeout: 60000,
    attestation: "direct",
    excludeCredentials: [], // fetch existing credentials to prevent duplicates
  };

  // Save challenge server-side session or DB for verification later

  res.status(200).json(options);
}
