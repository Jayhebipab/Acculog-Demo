// /pages/api/ModuleSales/Activity/AddLog.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function addActivityLog(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const {
      ReferenceID,
      Email,
      Type,
      Status,
      Location,
      Latitude,
      Longitude,
      PhotoURL,
      Remarks,
    } = req.body;

    /* 🔒 Basic validation */
    if (!ReferenceID || !Email || !Type || !Status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await connectToDatabase();
    const activityLogsCollection = db.collection("TaskLog");

    /* 📌 Build new log */
    const newLog: any = {
      ReferenceID,
      Email,
      Type,
      Status,
      Remarks,
      date_created: new Date(),
    };

    if (Location)  newLog.Location  = Location;
    if (Latitude)  newLog.Latitude  = Latitude;
    if (Longitude) newLog.Longitude = Longitude;
    if (PhotoURL)  newLog.PhotoURL  = PhotoURL;

    const result = await activityLogsCollection.insertOne(newLog);

    if (!result.acknowledged) {
      throw new Error("Failed to insert new log");
    }

    return res.status(201).json({ message: "Activity log added successfully" });
  } catch (error) {
    console.error("Error adding activity log:", error);
    return res.status(500).json({ error: "Failed to add activity log" });
  }
}
