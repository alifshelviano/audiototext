// lib/email-service.ts
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { notifyEmailRecipients } from "@/lib/services/notification-service";
import { getSocketIOInstance } from "@/lib/socket"; // You'll need to create this export
import clientPromise from "@/lib/database/mongodb"; // Import your MongoDB client

interface EmailOptions {
  to: string | string[];
  subject: string;
  meeting: any;
  summary: any;
  pdfAttachment?: {
    content: string;
    filename: string;
  };
}

// Enhanced meeting data optimization with size limits
function optimizeMeetingData(meeting: any, summary: any) {
  const structuredSummary = summary?.meeting_summary || summary;

  // Function to safely truncate arrays with ellipsis
  const truncateArray = (arr: any[], maxLength: number) => {
    if (!Array.isArray(arr)) return [];
    if (arr.length <= maxLength) return arr;

    return [...arr.slice(0, maxLength - 1), `... and ${arr.length - (maxLength - 1)} more`];
  };

  // Function to safely truncate strings
  const truncateString = (str: string, maxLength: number) => {
    if (typeof str !== "string") return str;
    if (str.length <= maxLength) return str;

    return str.substring(0, maxLength - 3) + "...";
  };

  return {
    // Basic meeting info with truncation
    name: truncateString(meeting.name || "Untitled Meeting", 100),
    time: meeting.time,

    // Optimized summary data with strict limits
    summary: {
      title: truncateString(structuredSummary?.title || meeting.name || "Meeting Summary", 80),
      date: structuredSummary?.date || new Date(meeting.time).toISOString().split("T")[0],
      time: structuredSummary?.time || new Date(meeting.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),

      // Strict array limits to prevent large emails
      participants: truncateArray(structuredSummary?.participants || [], 6),
      key_points: truncateArray(structuredSummary?.key_points || [], 4),
      insights_decisions: truncateArray(structuredSummary?.insights_decisions || [], 3),
      action_items: truncateArray(structuredSummary?.action_items || [], 3),
      summary_insights: truncateArray(structuredSummary?.summary_insights || [], 2),

      // Minimal sentiment data
      emotion_analysis: structuredSummary?.emotion_analysis
        ? {
            overall_sentiment: String(structuredSummary.emotion_analysis.overall_sentiment || "neutral").substring(0, 20),
            overall_confidence: Math.round((structuredSummary.emotion_analysis.overall_confidence || 0) * 100),
          }
        : null,

      // Minimal health score data
      meeting_health_score: structuredSummary?.meeting_health_score
        ? {
            overall_score: structuredSummary.meeting_health_score.overall_score || 0,
            engagement_score: structuredSummary.meeting_health_score.engagement_score || 0,
            productivity_score: structuredSummary.meeting_health_score.productivity_score || 0,
            collaboration_score: structuredSummary.meeting_health_score.collaboration_score || 0,
            clarity_score: structuredSummary.meeting_health_score.clarity_score || 0,
          }
        : null,

      // Minimal next meeting data
      next_meeting: structuredSummary?.next_meeting
        ? {
            date: String(structuredSummary.next_meeting.date || "").substring(0, 20),
            agenda: truncateArray(structuredSummary.next_meeting.agenda || [], 2),
          }
        : null,
    },
  };
}

// Create transporter with better configuration
let transporter: nodemailer.Transporter | null = null;
let lastVerification: number = 0;
const VERIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    // Validate required environment variables
    const requiredEnvVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing SMTP configuration: ${missingVars.join(", ")}`);
    }
    const port = parseInt(process.env.SMTP_PORT || "587");
    const isSecure = port === 465;

    const transporterConfig: SMTPTransport.Options = {
      host: process.env.SMTP_HOST!,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
      // Enhanced timeout settings - moved inside the config object
      connectionTimeout: 15000,
      socketTimeout: 30000,
      greetingTimeout: 10000,
    };

    transporter = nodemailer.createTransport(transporterConfig);

    // Add event listeners for better debugging
    transporter.on("idle", () => {
      console.log("SMTP transporter is idle");
    });

    transporter.on("error", (error) => {
      console.error("SMTP transporter error:", error);
    });
  }
  return transporter;
}

// Enhanced SMTP connection verification with caching
async function verifySMTPConnection(): Promise<boolean> {
  const now = Date.now();

  // Only verify every 5 minutes to avoid unnecessary checks
  if (now - lastVerification < VERIFICATION_INTERVAL) {
    return true;
  }

  const currentTransporter = getTransporter();

  try {
    await currentTransporter.verify();
    lastVerification = now;
    console.log("✅ SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);

    // Reset transporter to force reconnection on next attempt
    transporter = null;

    throw new Error(`Failed to connect to email server: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Improved email size estimation
function estimateEmailSize(htmlContent: string, pdfContent?: string): { sizeBytes: number; sizeMB: number } {
  let sizeBytes = Buffer.byteLength(htmlContent, "utf8");

  // Add overhead for email headers and structure (approx 2KB)
  sizeBytes += 2048;

  if (pdfContent) {
    // PDF content is base64, actual size is about 75% of base64 string
    // Plus MIME encoding overhead
    sizeBytes += Math.floor(pdfContent.length * 0.75) + 1024;
  }

  const sizeMB = sizeBytes / (1024 * 1024);

  return { sizeBytes, sizeMB };
}

// Enhanced email sending with better error handling, retries, and notifications
export async function sendEmailWithAttachment(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  attachmentSkipped?: boolean;
  sizeMB?: number;
}> {
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      await verifySMTPConnection();
      const currentTransporter = getTransporter();

      // Optimize data for email to reduce size
      const optimizedData = optimizeMeetingData(options.meeting, options.summary);
      const emailHtml = generateEmailHTML(optimizedData);

      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.SMTP_FROM || `LISN <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: emailHtml,
        // Add text version for better deliverability
        text: generateTextVersion(optimizedData),
        // Add headers for better tracking
        headers: {
          "X-LISN-System": "Meeting-Documentation",
          "X-Meeting-ID": options.meeting.id || "unknown",
        },
      };

      // Handle PDF attachment with size checks
      let attachmentSkipped = false;
      let estimatedSize = estimateEmailSize(emailHtml);

      if (options.pdfAttachment) {
        estimatedSize = estimateEmailSize(emailHtml, options.pdfAttachment.content);

        console.log(`📧 Estimated email size: ${estimatedSize.sizeMB.toFixed(2)} MB`);

        // Conservative size limit (Gmail limit is 25MB, but let's use 15MB for safety)
        const SIZE_LIMIT_MB = 15;

        if (estimatedSize.sizeMB < SIZE_LIMIT_MB) {
          mailOptions.attachments = [
            {
              filename: options.pdfAttachment.filename,
              content: options.pdfAttachment.content,
              encoding: "base64" as const,
              contentType: "application/pdf",
            },
          ];
        } else {
          console.warn(`⚠️ Email too large (${estimatedSize.sizeMB.toFixed(2)} MB), sending without PDF attachment`);
          attachmentSkipped = true;

          // Add note to email about attachment being too large
          const sizeNote = `<p style="color: #d32f2f; font-size: 12px; margin-top: 15px; padding: 10px; background: #ffebee; border-radius: 4px;">
            <strong>Note:</strong> The PDF report (${estimatedSize.sizeMB.toFixed(1)} MB) was too large to send via email. 
            Please access the complete documentation in your LISN dashboard.
          </p>`;

          // Ensure html is a string before calling replace
          if (typeof mailOptions.html === "string") {
            mailOptions.html = mailOptions.html.replace("</body>", `${sizeNote}</body>`);
          } else {
            // If html is not a string, create a new string with the note
            mailOptions.html = `${emailHtml}${sizeNote}`;
          }
        }
      }

      const result = await currentTransporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully: ${result.messageId}`);

      // NEW: Trigger notifications for email recipients
      try {
        await notifyEmailRecipients(options.meeting.id, options.meeting.name, Array.isArray(options.to) ? options.to : [options.to]);

        // Also emit Socket.IO event for real-time notification
        const io = getSocketIOInstance();
        const validEmails = Array.isArray(options.to) ? options.to : [options.to];

        for (const email of validEmails) {
          // Get userId from email
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection("users").findOne({
            email: email.toLowerCase(),
          });

          if (user) {
            io.to(`user-${user._id.toString()}`).emit("new-notification", {
              type: "email_received",
              title: "Meeting Summary Received",
              message: `You've received the summary for "${options.meeting.name}"`,
              meetingId: options.meeting.id,
              meetingName: options.meeting.name,
            });
          }
        }
      } catch (notificationError) {
        // Don't fail the email send if notifications fail
        console.error("❌ Failed to send notifications:", notificationError);
      }

      return {
        success: true,
        messageId: result.messageId,
        attachmentSkipped,
        sizeMB: estimatedSize.sizeMB,
      };
    } catch (error) {
      retryCount++;
      console.error(`❌ Email sending failed (attempt ${retryCount}/${maxRetries + 1}):`, error);

      if (retryCount > maxRetries) {
        // Final failure
        if (error instanceof Error) {
          throw new Error(`Failed to send email after ${maxRetries + 1} attempts: ${error.message}`);
        } else {
          throw new Error(`Failed to send email after ${maxRetries + 1} attempts: Unknown error`);
        }
      }

      // Wait before retry (exponential backoff)
      const waitTime = 1000 * Math.pow(2, retryCount);
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // This should never be reached, but TypeScript wants a return
  throw new Error("Unexpected error in email sending");
}

// Simplified function for emails without attachments
export async function sendEmailWithoutAttachment(options: Omit<EmailOptions, "pdfAttachment">): Promise<{
  success: boolean;
  messageId?: string;
  sizeMB?: number;
}> {
  await verifySMTPConnection();
  const currentTransporter = getTransporter();

  // Optimize data for email to reduce size
  const optimizedData = optimizeMeetingData(options.meeting, options.summary);
  const emailHtml = generateEmailHTML(optimizedData);
  const estimatedSize = estimateEmailSize(emailHtml);

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_FROM || `LISN <${process.env.SMTP_USER}>`,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: emailHtml,
    text: generateTextVersion(optimizedData),
    headers: {
      "X-LISN-System": "Meeting-Documentation",
      "X-Meeting-ID": options.meeting.id || "unknown",
    },
  };

  try {
    const result = await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully without attachment: ${result.messageId}`);

    // NEW: Also trigger notifications for emails without attachments
    try {
      await notifyEmailRecipients(options.meeting.id, options.meeting.name, Array.isArray(options.to) ? options.to : [options.to]);
    } catch (notificationError) {
      console.error("❌ Failed to send notifications:", notificationError);
    }

    return {
      success: true,
      messageId: result.messageId,
      sizeMB: estimatedSize.sizeMB,
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Generate plain text version for better email client compatibility
function generateTextVersion(data: any): string {
  const meeting = data;
  const summary = data.summary;

  let text = `MEETING SUMMARY: ${summary.title}\n`;
  text += `Date: ${summary.date} | Time: ${summary.time}\n`;
  text += "=".repeat(50) + "\n\n";

  if (summary.participants.length > 0) {
    text += "PARTICIPANTS:\n";
    text += summary.participants.join(", ") + "\n\n";
  }

  if (summary.key_points.length > 0) {
    text += "KEY POINTS:\n";
    summary.key_points.forEach((point: string, index: number) => {
      text += `• ${point}\n`;
    });
    text += "\n";
  }

  if (summary.action_items.length > 0) {
    text += "ACTION ITEMS:\n";
    summary.action_items.forEach((item: any) => {
      const task = typeof item === "string" ? item : item.task;
      text += `• ${task}\n`;
    });
    text += "\n";
  }

  text += "---\n";
  text += "This summary was generated by LISN Documentation System\n";
  text += "Complete documentation available in your LISN dashboard\n";

  return text;
}

// Enhanced HTML email template
function generateEmailHTML(data: any): string {
  const meeting = data;
  const summary = data.summary;

  // Safe HTML escaping function
  const escapeHtml = (unsafe: any): string => {
    if (typeof unsafe !== "string") return String(unsafe || "");
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };

  // Helper to render array items safely
  const renderListItems = (items: any[]): string => {
    if (!Array.isArray(items) || items.length === 0) return "";

    return items
      .map((item) => {
        const text = typeof item === "string" ? item : item.task || JSON.stringify(item);
        return `<li>${escapeHtml(text)}</li>`;
      })
      .join("");
  };

  // Helper to get sentiment class
  const getSentimentClass = (sentiment: string): string => {
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("positive")) return "sentiment-positive";
    if (lowerSentiment.includes("negative")) return "sentiment-negative";
    return "sentiment-neutral";
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      line-height: 1.5; 
      color: #333333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background: #f8f9fa;
    }
    .email-container {
      background: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }
    .section { 
      margin-bottom: 25px; 
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c5aa0;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e9ecef;
    }
    ul { 
      padding-left: 20px; 
      margin: 0; 
    }
    li { 
      margin-bottom: 6px; 
      line-height: 1.4;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: #2c5aa0;
      color: #ffffff;
      border-radius: 12px;
      font-size: 10px;
      margin-left: 8px;
      font-weight: 500;
    }
    .footer { 
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      font-size: 12px;
      color: #6c757d;
      text-align: center;
    }
    .health-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .health-item {
      text-align: center;
      padding: 10px;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      background: #f8f9fa;
    }
    .health-value {
      font-size: 18px;
      font-weight: 600;
      color: #2c5aa0;
    }
    .health-label {
      font-size: 11px;
      color: #6c757d;
      margin-top: 4px;
    }
    .sentiment-indicator {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 500;
      margin-right: 8px;
    }
    .sentiment-positive { background: #d4edda; color: #155724; }
    .sentiment-neutral { background: #e2e3e5; color: #383d41; }
    .sentiment-negative { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #2c5aa0;">📋 ${escapeHtml(summary.title)}</h1>
      <p style="margin: 0; color: #6c757d; font-size: 14px;">${escapeHtml(summary.date)} • ${escapeHtml(summary.time)}</p>
    </div>
    
    <!-- Participants -->
    ${
      summary.participants.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">👥 Participants (${summary.participants.length})</h2>
      <div style="color: #495057;">
        ${summary.participants.map((p: string) => `<span style="display: inline-block; margin: 0 8px 6px 0;">${escapeHtml(p)}</span>`).join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- Key Points -->
    ${
      summary.key_points.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">🎯 Key Discussion Points</h2>
      <ul>
        ${renderListItems(summary.key_points)}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Action Items -->
    ${
      summary.action_items.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">✅ Action Items</h2>
      <ul>
        ${summary.action_items
          .map((item: any) => {
            const task = escapeHtml(typeof item === "string" ? item : item.task);
            const assignedTo = escapeHtml(item.assigned_to || "Not assigned");
            const status = escapeHtml(item.status || "Pending");
            const statusColor = status.toLowerCase() === "completed" ? "#28a745" : status.toLowerCase() === "in progress" ? "#ffc107" : "#6c757d";

            return `<li>
            <strong>${task}</strong><br>
            <small style="color: #6c757d;">👤 ${assignedTo} • <span style="color: ${statusColor}">${status}</span></small>
          </li>`;
          })
          .join("")}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Insights & Decisions -->
    ${
      summary.insights_decisions.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">💡 Insights & Decisions</h2>
      <ul>
        ${renderListItems(summary.insights_decisions)}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Sentiment Analysis -->
    ${
      summary.emotion_analysis
        ? `
    <div class="section">
      <h2 class="section-title">😊 Meeting Sentiment</h2>
      <div>
        <span class="sentiment-indicator ${getSentimentClass(summary.emotion_analysis.overall_sentiment)}">
          ${escapeHtml(summary.emotion_analysis.overall_sentiment.toUpperCase())}
        </span>
        <span style="font-size: 13px; color: #6c757d;">
          Confidence: ${summary.emotion_analysis.overall_confidence}%
        </span>
      </div>
    </div>
    `
        : ""
    }

    <!-- Meeting Health Score -->
    ${
      summary.meeting_health_score
        ? `
    <div class="section">
      <h2 class="section-title">📈 Meeting Health Score</h2>
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 32px; font-weight: 700; color: #2c5aa0; margin-bottom: 5px;">
          ${summary.meeting_health_score.overall_score}
        </div>
        <div style="font-size: 12px; color: #6c757d;">Overall Score / 100</div>
      </div>
      <div class="health-grid">
        <div class="health-item">
          <div class="health-value">${summary.meeting_health_score.engagement_score}</div>
          <div class="health-label">Engagement</div>
        </div>
        <div class="health-item">
          <div class="health-value">${summary.meeting_health_score.productivity_score}</div>
          <div class="health-label">Productivity</div>
        </div>
        <div class="health-item">
          <div class="health-value">${summary.meeting_health_score.collaboration_score}</div>
          <div class="health-label">Collaboration</div>
        </div>
        <div class="health-item">
          <div class="health-value">${summary.meeting_health_score.clarity_score}</div>
          <div class="health-label">Clarity</div>
        </div>
      </div>
    </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>📎 Complete meeting documentation is available in your LISN dashboard</strong>
      </p>
      <p style="margin: 0; font-size: 11px;">
        This summary was generated automatically by LISN AI Documentation System<br>
        © ${new Date().getFullYear()} LISN. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Enhanced utility functions
export function shouldIncludePDF(meeting: any): boolean {
  const transcriptCount = meeting.transcripts?.length || 0;
  const estimatedSize = estimatePDFSize(meeting);

  // More conservative limits
  return transcriptCount < 30 && estimatedSize < 10 * 1024 * 1024; // 10MB limit
}

export function estimatePDFSize(meeting: any): number {
  const transcriptCount = meeting.transcripts?.length || 0;
  // More accurate estimate: 3KB per transcript + 20KB base for formatting
  return (transcriptCount * 3 + 20) * 1024;
}

// New function to close transporter (useful for cleanup)
export async function closeTransporter(): Promise<void> {
  if (transporter) {
    await transporter.close();
    transporter = null;
    console.log("📧 SMTP transporter closed");
  }
}

// Health check function
export async function checkEmailServiceHealth(): Promise<{
  healthy: boolean;
  message: string;
  details?: any;
}> {
  try {
    await verifySMTPConnection();
    return {
      healthy: true,
      message: "Email service is healthy and connected",
      details: {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        lastVerification: new Date(lastVerification).toISOString(),
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Email service is unhealthy: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error },
    };
  }
}

// Fixed password reset email function
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  await verifySMTPConnection();
  const currentTransporter = getTransporter();

  // Use the correct frontend URL
  const resetUrl = `${process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

  // Store the token temporarily (in production, use your database)
  const resetTokens = new Map();
  resetTokens.set(resetToken, {
    email,
    expires: Date.now() + 60 * 5  * 1000, //5 minutes from now
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_FROM || "LISN <noreply@lisn.com>",
    to: email,
    subject: "Reset Your LISN Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg,rgb(106, 200, 223) 0%,rgb(19, 154, 163) 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { background: linear-gradient(135deg, rgb(106, 200, 223) 0%, rgb(19, 154, 163) 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to reset your password for your LISN account. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <div class="warning">
                <strong>Important:</strong> This link will expire in 5 minutes for security reasons.
                If you didn't request this reset, please ignore this email.
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>

              <div class="footer">
                <p>© ${new Date().getFullYear()} LISN. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const result = await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}: ${result.messageId}`);
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
