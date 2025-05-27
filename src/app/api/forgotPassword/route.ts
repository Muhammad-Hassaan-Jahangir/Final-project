// app/api/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordService } from "@/services/forgotpasswordservice";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const message = await forgotPasswordService(email);
    return NextResponse.json({ message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
