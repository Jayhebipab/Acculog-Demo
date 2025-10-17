import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

interface ResponseData {
  userId?: string;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { FingerprintKey } = req.body;

  if (!FingerprintKey || typeof FingerprintKey !== "string" || !FingerprintKey.trim()) {
    return res.status(400).json({ error: "FingerprintKey is required" });
  }

  try {
    const db = await connectToDatabase();
    const userCollection = db.collection("users");

    // Find user by FingerprintKey
    const user = await userCollection.findOne({ FingerprintKey: FingerprintKey.trim() });

    if (!user) {
      return res.status(401).json({ error: "Invalid fingerprint key" });
    }

    return res.status(200).json({ userId: user._id.toString(), message: "Login successful" });
  } catch (error) {
    console.error("Fingerprint login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
