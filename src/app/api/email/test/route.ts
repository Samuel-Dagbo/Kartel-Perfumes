import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { testEmailTemplate } from "@/lib/email-templates";
import { requireRole } from "@/lib/authz";

export async function POST() {
  try {
    await requireRole(["admin"]);

    const recipient = process.env.EMAIL_TEST_RECIPIENT;
    if (!recipient) {
      return NextResponse.json({ error: "EMAIL_TEST_RECIPIENT is not configured" }, { status: 500 });
    }

    await sendEmail({
      to: { email: recipient, name: "Kartel Admin" },
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
