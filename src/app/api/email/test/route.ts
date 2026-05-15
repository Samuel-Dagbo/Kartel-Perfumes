import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { testEmailTemplate } from "@/lib/email-templates";

export async function POST() {
  try {
    await sendEmail({
      to: { email: "samueldagbo50@gmail.com", name: "Samuel" },
      subject: "Kartel — Email Service Test",
      html: testEmailTemplate(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send test email" },
      { status: 500 }
    );
  }
}
