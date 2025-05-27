import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../models/userModel";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    const users = await User.find({
      resetPasswordExpire: { $gt: Date.now() }
    });

    let matchedUser = null;

    for (const user of users) {
      const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) throw new Error("Token invalid ya expire ho gaya");

    matchedUser.password = await bcrypt.hash(password, 10);
    matchedUser.resetPasswordToken = undefined;
    matchedUser.resetPasswordExpire = undefined;

    await matchedUser.save();

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
