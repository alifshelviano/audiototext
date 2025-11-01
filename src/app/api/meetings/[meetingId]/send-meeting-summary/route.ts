// app/api/meetings/[meetingId]/send-meeting-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMeeting } from "@/lib/meetings";
import { sendEmailWithAttachment, sendEmailWithoutAttachment, shouldIncludePDF, estimatePDFSize } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ meetingId: string }> }) {
  try {
    const { recipientEmails, pdfContent } = await request.json();
    const { meetingId } = await params;

    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json({ message: "Recipient emails are required" }, { status: 400 });
    }

    const meeting = await getMeeting({ meetingId });
    if (!meeting) {
      return NextResponse.json({ message: "Meeting not found" }, { status: 404 });
    }

    const validEmails = recipientEmails.filter((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

    if (validEmails.length === 0) {
      return NextResponse.json({ message: "No valid email addresses provided" }, { status: 400 });
    }

    // Base email options
    const emailOptions = {
      to: validEmails,
      subject: `Meeting Summary: ${meeting.name}`,
      meeting: meeting,
      summary: meeting.summary?.meeting_summary || meeting.summary,
    };

    let emailResults;
    let attachmentSkipped = false;

    // Check if we should include PDF and if PDF content is provided
    if (pdfContent && shouldIncludePDF(meeting)) {
      const estimatedSize = estimatePDFSize(meeting);
      console.log(`Estimated PDF size: ${Math.round(estimatedSize / 1024)} KB`);

      // Check if PDF is too large (conservative 15MB limit)
      if (estimatedSize < 15 * 1024 * 1024) {
        try {
          emailResults = await sendEmailWithAttachment({
            ...emailOptions,
            pdfAttachment: {
              content: pdfContent,
              filename: `meeting-summary-${meeting.name.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
            },
          });

          // Check if attachment was skipped in the send process
          attachmentSkipped = (emailResults as any).attachmentSkipped || false;
        } catch (attachmentError) {
          console.error("Failed to send with attachment, trying without...", attachmentError);
          // Fallback to email without attachment
          emailResults = await sendEmailWithoutAttachment(emailOptions);
          attachmentSkipped = true;
        }
      } else {
        console.warn("PDF too large, sending without attachment");
        emailResults = await sendEmailWithoutAttachment(emailOptions);
        attachmentSkipped = true;
      }
    } else {
      // No PDF content provided or shouldn't include PDF
      console.log("Sending email without PDF attachment");
      emailResults = await sendEmailWithoutAttachment(emailOptions);
      attachmentSkipped = true;
    }

    const responseMessage = attachmentSkipped ? `Meeting summary sent successfully to ${validEmails.length} recipients (PDF skipped due to size)` : `Meeting summary sent successfully to ${validEmails.length} recipients`;

    return NextResponse.json({
      message: responseMessage,
      sentTo: validEmails,
      results: emailResults,
      attachmentIncluded: !attachmentSkipped,
    });
  } catch (error: any) {
    console.error("Error sending meeting summary:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send meeting summary";
    let statusCode = 500;

    if (error.message?.includes("SMTP configuration")) {
      errorMessage = "Email service is not configured properly";
      statusCode = 500;
    } else if (error.message?.includes("connection")) {
      errorMessage = "Unable to connect to email service";
      statusCode = 503;
    } else if (error.message?.includes("authentication")) {
      errorMessage = "Email authentication failed";
      statusCode = 500;
    }

    return NextResponse.json(
      {
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}
