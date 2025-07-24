import {NextRequest, NextResponse} from "next/server";
import {appendToSheet} from "@/lib/googleSheets";

export async function POST(req: NextRequest) {
  try {
    const {firstName, lastName, email, phone, heardFrom, timestamp, today} =
      await req.json();
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      return NextResponse.json(
        {error: "First Name is required"},
        {status: 400}
      );
    }
    if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
      return NextResponse.json({error: "Last Name is required"}, {status: 400});
    }
    if (!timestamp || typeof timestamp !== "string") {
      return NextResponse.json({error: "Timestamp is required"}, {status: 400});
    }
    if (!today || typeof today !== "string") {
      return NextResponse.json({error: "Date is required"}, {status: 400});
    }

    const values = [
      timestamp,
      firstName,
      lastName,
      email || "",
      phone || "",
      heardFrom || "",
    ];
    await appendToSheet({values, tabName: today});
    return NextResponse.json({success: true});
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      {error: "Failed to register, please try again."},
      {status: 500}
    );
  }
}
