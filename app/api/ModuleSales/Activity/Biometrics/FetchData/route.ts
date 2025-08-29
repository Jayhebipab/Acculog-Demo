// app/api/ModuleSales/Activity/Biometrics/FetchData/route.ts
import { NextResponse } from "next/server";
import net from "net";

export const dynamic = "force-dynamic";

interface DeviceParams {
  ip: string;
  port: number;
}

export async function GET(req: Request) {
  try {
    const device: DeviceParams = {
      ip: process.env.DEVICE_IP || "192.168.0.21",
      port: parseInt(process.env.DEVICE_PORT || "5005"),
    };

    // TCP connection simulation
    const client = new net.Socket();
    const data: any[] = [];

    await new Promise<void>((resolve, reject) => {
      client.connect(device.port, device.ip, () => {
        console.log("Connected to device:", device.ip);
      });

      client.on("data", (chunk) => {
        console.log("Data chunk received:", chunk.toString());
      });

      client.on("close", () => {
        resolve();
      });

      client.on("error", (err) => {
        reject(err);
      });
    });

    return NextResponse.json({ success: true, data: data.slice(0, 5) });
  } catch (err: any) {
    console.error("FetchDeviceData error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch device data." },
      { status: 500 }
    );
  }
}
