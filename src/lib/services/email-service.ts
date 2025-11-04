// lib/email-service.ts
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { notifyEmailRecipients } from "@/lib/services/notification-service";
import clientPromise from "@/lib/database/mongodb";
import { getSocketIOInstanceSafe, isSocketIOInitialized } from "@/lib/socket";


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


// Add this function to compress PDF before sending
function compressPDFContent(pdfBase64: string): string {
  const base64Content = pdfBase64.includes(",") ? pdfBase64.split(",")[1] : pdfBase64;


  // Calculate actual size
  const estimatedSize = (base64Content.length * 0.75) / (1024 * 1024); // MB


  console.log(`📊 PDF size before compression: ${estimatedSize.toFixed(2)} MB`);


  // More conservative limits for email
  if (estimatedSize > 15) {
    // 15MB limit for email
    throw new Error(`PDF too large for email (${estimatedSize.toFixed(1)} MB). Please use export instead.`);
  }


  if (estimatedSize > 5) {
    // 5MB warning
    console.warn(`⚠️ Large PDF for email: ${estimatedSize.toFixed(1)} MB`);
  }


  return base64Content;
}


async function sendRealtimeNotifications(meetingId: string, meetingName: string, emailRecipients: string[]): Promise<void> {
  // Only proceed if Socket.IO is initialized
  if (!isSocketIOInitialized()) {
    console.warn("⚠️ Socket.IO not initialized - skipping real-time notifications");
    return;
  }


  const io = getSocketIOInstanceSafe();
  if (!io) {
    console.warn("⚠️ Socket.IO instance unavailable - skipping real-time notifications");
    return;
  }


  const validEmails = Array.isArray(emailRecipients) ? emailRecipients : [emailRecipients];


  for (const email of validEmails) {
    try {
      const client = await clientPromise;
      const db = client.db();
      const user = await db.collection("users").findOne({
        email: email.toLowerCase(),
      });


      if (user) {
        io.to(`user-${user._id.toString()}`).emit("new-notification", {
          type: "email_received",
          title: "Meeting Summary Received",
          message: `You've received the summary for "${meetingName}"`,
          meetingId: meetingId,
          meetingName: meetingName,
          timestamp: new Date().toISOString(),
        });
        console.log(`✅ Sent real-time notification to ${email}`);
      } else {
        console.log(`ℹ️ User not found for email: ${email}`);
      }
    } catch (userError) {
      console.error(`Failed to send notification to ${email}:`, userError);
      // Continue with other users even if one fails
    }
  }
}


// // Enhanced email sending with better error handling, retries, and notifications
// export async function sendEmailWithAttachment(options: EmailOptions): Promise<{
//   success: boolean;
//   messageId?: string;
//   attachmentSkipped?: boolean;
//   sizeMB?: number;
// }> {
//   let retryCount = 0;
//   const maxRetries = 2;


//   while (retryCount <= maxRetries) {
//     try {
//       await verifySMTPConnection();
//       const currentTransporter = getTransporter();


//       // Optimize data for email to reduce size
//       const optimizedData = optimizeMeetingData(options.meeting, options.summary);
//       const emailHtml = generateEmailHTML(optimizedData);


//       const mailOptions: nodemailer.SendMailOptions = {
//         from: process.env.SMTP_FROM || `LISN <${process.env.SMTP_USER}>`,
//         to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
//         subject: options.subject,
//         html: emailHtml,
//         // Add text version for better deliverability
//         text: generateTextVersion(optimizedData),
//         // Add headers for better tracking
//         headers: {
//           "X-LISN-System": "Meeting-Documentation",
//           "X-Meeting-ID": options.meeting.id || "unknown",
//         },
//       };


//       // Handle PDF attachment with size checks
//       let attachmentSkipped = false;
//       let estimatedSize = estimateEmailSize(emailHtml);


//       if (options.pdfAttachment) {
//         estimatedSize = estimateEmailSize(emailHtml, options.pdfAttachment.content);


//         console.log(`📧 Estimated email size: ${estimatedSize.sizeMB.toFixed(2)} MB`);


//         // Conservative size limit (Gmail limit is 25MB, but let's use 15MB for safety)
//         const SIZE_LIMIT_MB = 15;


//         if (estimatedSize.sizeMB < SIZE_LIMIT_MB) {
//           const compressedContent = compressPDFContent(options.pdfAttachment.content);
//           mailOptions.attachments = [
//             {
//               filename: options.pdfAttachment.filename,
//               content: compressedContent,
//               encoding: "base64" as const,
//               contentType: "application/pdf",
//             },
//           ];
//         } else {
//           console.warn(`⚠️ Email too large (${estimatedSize.sizeMB.toFixed(2)} MB), sending without PDF attachment`);
//           attachmentSkipped = true;


//           // Add note to email about attachment being too large
//           const sizeNote = `<p style="color: #d32f2f; font-size: 12px; margin-top: 15px; padding: 10px; background: #ffebee; border-radius: 4px;">
//             <strong>Note:</strong> The PDF report (${estimatedSize.sizeMB.toFixed(1)} MB) was too large to send via email.
//             Please access the complete documentation in your LISN dashboard.
//           </p>`;


//           // Ensure html is a string before calling replace
//           if (typeof mailOptions.html === "string") {
//             mailOptions.html = mailOptions.html.replace("</body>", `${sizeNote}</body>`);
//           } else {
//             // If html is not a string, create a new string with the note
//             mailOptions.html = `${emailHtml}${sizeNote}`;
//           }
//         }
//       }


//       const result = await currentTransporter.sendMail(mailOptions);
//       console.log(`✅ Email sent successfully: ${result.messageId}`);


//       // NEW: Trigger notifications for email recipients
//       try {
//         await notifyEmailRecipients(options.meeting.id, options.meeting.name, Array.isArray(options.to) ? options.to : [options.to]);
//         await sendRealtimeNotifications(options.meeting.id, options.meeting.name, Array.isArray(options.to) ? options.to : [options.to]);


//         // ✅ SAFE: Only emit Socket.IO events if initialized
//         if (isSocketIOInitialized()) {
//           const io = getSocketIOInstanceSafe();
//           if (io) {
//             const validEmails = Array.isArray(options.to) ? options.to : [options.to];


//             for (const email of validEmails) {
//               try {
//                 const client = await clientPromise;
//                 const db = client.db();
//                 const user = await db.collection("users").findOne({
//                   email: email.toLowerCase(),
//                 });


//                 if (user) {
//                   io.to(`user-${user._id.toString()}`).emit("new-notification", {
//                     type: "email_received",
//                     title: "Meeting Summary Received",
//                     message: `You've received the summary for "${options.meeting.name}"`,
//                     meetingId: options.meeting.id,
//                     meetingName: options.meeting.name,
//                     timestamp: new Date().toISOString(),
//                   });
//                   console.log(`✅ Sent real-time notification to ${email}`);
//                 }
//               } catch (userError) {
//                 console.error(`Failed to send notification to ${email}:`, userError);
//                 // Continue with other users even if one fails
//               }
//             }
//           }
//         } else {
//           console.warn("⚠️ Socket.IO not initialized - skipping real-time notifications");
//         }
//       } catch (notificationError) {
//         // Don't fail the email send if notifications fail
//         console.error("❌ Failed to send notifications:", notificationError);
//       }


//       return {
//         success: true,
//         messageId: result.messageId,
//         attachmentSkipped,
//         sizeMB: estimatedSize.sizeMB,
//       };
//     } catch (error) {
//       retryCount++;
//       console.error(`❌ Email sending failed (attempt ${retryCount}/${maxRetries + 1}):`, error);


//       if (retryCount > maxRetries) {
//         // Final failure
//         if (error instanceof Error) {
//           throw new Error(`Failed to send email after ${maxRetries + 1} attempts: ${error.message}`);
//         } else {
//           throw new Error(`Failed to send email after ${maxRetries + 1} attempts: Unknown error`);
//         }
//       }


//       // Wait before retry (exponential backoff)
//       const waitTime = 1000 * Math.pow(2, retryCount);
//       console.log(`⏳ Retrying in ${waitTime}ms...`);
//       await new Promise((resolve) => setTimeout(resolve, waitTime));
//     }
//   }


//   // This should never be reached, but TypeScript wants a return
//   throw new Error("Unexpected error in email sending");
// }


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
          const compressedContent = compressPDFContent(options.pdfAttachment.content);
          mailOptions.attachments = [
            {
              filename: options.pdfAttachment.filename,
              content: compressedContent,
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


      // NEW: Trigger notifications for email recipients using API route
      try {
        await notifyEmailRecipients(options.meeting.id, options.meeting.name, Array.isArray(options.to) ? options.to : [options.to]);


        // Get user IDs for email recipients and send notifications via API
        const validEmails = Array.isArray(options.to) ? options.to : [options.to];
        const client = await clientPromise;
        const db = client.db();


        const userIds: string[] = [];
        for (const email of validEmails) {
          const user = await db.collection("users").findOne({
            email: email.toLowerCase(),
          });
          if (user && user._id) {
            userIds.push(user._id.toString());
          }
        }


        if (userIds.length > 0) {
          try {
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:9002";
            const notificationResponse = await fetch(`${baseUrl}/api/notifications/send`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userIds,
                notification: {
                  type: "email_received",
                  title: "Meeting Summary Received",
                  message: `You've received the summary for "${options.meeting.name}"`,
                  meetingId: options.meeting.id,
                  meetingName: options.meeting.name,
                },
              }),
            });


            if (notificationResponse.ok) {
              const result = await notificationResponse.json();
              console.log(`✅ Notifications processed: ${result.message}`);
            } else {
              console.warn("⚠️ Failed to send notifications via API");
            }
          } catch (apiError) {
            console.warn("⚠️ Notification API call failed:", apiError);
          }
        } else {
          console.log("ℹ️ No valid user IDs found for notifications");
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


// Helper function to send notifications via API
async function sendNotificationsViaAPI(userIds: string[], notificationData: any): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:9002";
    const response = await fetch(`${baseUrl}/api/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIds,
        notification: notificationData,
      }),
    });


    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }


    const result = await response.json();
    console.log(`✅ Notifications sent via API: ${result.message}`);
  } catch (error) {
    console.error("❌ Failed to send notifications via API:", error);
    throw error;
  }
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
      await sendRealtimeNotifications(options.meeting.id, options.meeting.name, Array.isArray(options.to) ? options.to : [options.to]);
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
        return `<li class="list-item">${escapeHtml(text)}</li>`;
      })
      .join("");
  };


  // Helper to get sentiment class and emoji
  const getSentimentConfig = (sentiment: string) => {
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("positive"))
      return {
        class: "sentiment-positive",
        emoji: "😊",
      };
    if (lowerSentiment.includes("negative"))
      return {
        class: "sentiment-negative",
        emoji: "😔",
      };
    return {
      class: "sentiment-neutral",
      emoji: "😐",
    };
  };


  // Helper to render participant chips
  const renderParticipants = (participants: string[]): string => {
    if (!participants.length) return "";


    return participants.map((participant) => `<span class="participant-chip">${escapeHtml(participant)}</span>`).join("");
  };


  // Helper to render action items with status
  const renderActionItems = (items: any[]): string => {
    if (!items.length) return "";


    return items
      .map((item) => {
        const task = escapeHtml(typeof item === "string" ? item : item.task);
        const assignedTo = escapeHtml(item.assigned_to || "Not assigned");
        const status = escapeHtml(item.status || "Pending");
        const statusConfig = getStatusConfig(status);


        return `
          <div class="action-item">
            <div class="action-content">
              <span class="action-icon">✅</span>
              <div class="action-details">
                <div class="action-task">${task}</div>
                <div class="action-meta">
                  <span class="assignee">👤 ${assignedTo}</span>
                  <span class="status ${statusConfig.class}">${statusConfig.emoji} ${status}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  };


  // Helper to get status configuration
  const getStatusConfig = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed"))
      return {
        class: "status-completed",
        emoji: "✅",
      };
    if (lowerStatus.includes("progress"))
      return {
        class: "status-progress",
        emoji: "🔄",
      };
    return {
      class: "status-pending",
      emoji: "⏳",
    };
  };


  const sentimentConfig = summary.emotion_analysis ? getSentimentConfig(summary.emotion_analysis.overall_sentiment) : { class: "sentiment-neutral", emoji: "😐" };


  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Summary: ${escapeHtml(summary.title)}</title>
  <style>
    /* Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
   
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
   
    .email-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
   
    .email-container {
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }
   
    /* Header Section */
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: -40px -40px 32px -40px;
      padding: 40px;
      border-radius: 16px 16px 0 0;
      color: white;
    }
   
    .header-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }
   
    .header-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      color: white;
    }
   
    .header-subtitle {
      font-size: 16px;
      opacity: 0.9;
      color: white;
    }
   
    /* Section Styles */
    .section {
      margin-bottom: 32px;
      background: #f8fafc;
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
   
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
   
    .section-icon {
      font-size: 20px;
    }
   
    /* Participants */
    .participants-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
   
    .participant-chip {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }
   
    .participant-chip:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
   
    /* Lists */
    .list {
      list-style: none;
      space-y: 12px;
    }
   
    .list-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      border-left: 3px solid #667eea;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }
   
    .list-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
   
    /* Action Items */
    .action-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
   
    .action-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
   
    .action-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
   
    .action-icon {
      font-size: 18px;
      margin-top: 2px;
    }
   
    .action-details {
      flex: 1;
    }
   
    .action-task {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
   
    .action-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #718096;
    }
   
    .assignee {
      display: flex;
      align-items: center;
      gap: 4px;
    }
   
    .status {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
   
    .status-completed {
      background: #c6f6d5;
      color: #22543d;
    }
   
    .status-progress {
      background: #bee3f8;
      color: #1a365d;
    }
   
    .status-pending {
      background: #fed7d7;
      color: #742a2a;
    }
   
    /* Sentiment Analysis */
    .sentiment-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 2px solid;
      transition: all 0.3s ease;
    }
   
    .sentiment-card:hover {
      transform: scale(1.02);
    }
   
    .sentiment-positive {
      border-color: #48bb78;
      background: linear-gradient(135deg, #c6f6d5, #ffffff);
    }
   
    .sentiment-neutral {
      border-color: #ed8936;
      background: linear-gradient(135deg, #fed7d7, #ffffff);
    }
   
    .sentiment-negative {
      border-color: #f56565;
      background: linear-gradient(135deg, #fed7d7, #ffffff);
    }
   
    .sentiment-emoji {
      font-size: 32px;
      margin-bottom: 8px;
    }
   
    .sentiment-text {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
    }
   
    .sentiment-confidence {
      font-size: 14px;
      color: #718096;
    }
   
    /* Health Score */
    .health-score {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      margin-bottom: 20px;
    }
   
    .health-score-value {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 8px;
    }
   
    .health-score-label {
      font-size: 16px;
      opacity: 0.9;
    }
   
    .health-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
   
    .health-metric {
      background: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
   
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 4px;
    }
   
    .metric-label {
      font-size: 12px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
   
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #718096;
    }
   
    .footer-attachment {
      background: #edf2f7;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
   
    .footer-text {
      font-size: 14px;
      line-height: 1.5;
    }
   
    .footer-copyright {
      font-size: 12px;
      margin-top: 8px;
      opacity: 0.7;
    }
   
    /* Responsive Design */
    @media (max-width: 480px) {
      body {
        padding: 10px;
      }
     
      .email-container {
        padding: 20px;
      }
     
      .header {
        margin: -20px -20px 24px -20px;
        padding: 30px 20px;
      }
     
      .header-title {
        font-size: 24px;
      }
     
      .section {
        padding: 16px;
      }
     
      .health-grid {
        grid-template-columns: 1fr;
      }
     
      .action-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <span class="header-icon">📋</span>
        <h1 class="header-title">${escapeHtml(summary.title)}</h1>
        <p class="header-subtitle">${escapeHtml(summary.date)} • ${escapeHtml(summary.time)}</p>
      </div>
     
      <!-- Participants -->
      ${
        summary.participants.length > 0
          ? `
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">👥</span>
          Participants (${summary.participants.length})
        </h2>
        <div class="participants-grid">
          ${renderParticipants(summary.participants)}
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
        <h2 class="section-title">
          <span class="section-icon">🎯</span>
          Key Discussion Points
        </h2>
        <ul class="list">
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
        <h2 class="section-title">
          <span class="section-icon">✅</span>
          Action Items
        </h2>
        <div class="action-items">
          ${renderActionItems(summary.action_items)}
        </div>
      </div>
      `
          : ""
      }




      <!-- Insights & Decisions -->
      ${
        summary.insights_decisions.length > 0
          ? `
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">💡</span>
          Insights & Decisions
        </h2>
        <ul class="list">
          ${renderListItems(summary.insights_decisions)}
        </ul>
      </div>
      `
          : ""
      }




      <!-- Summary Insights -->
      ${
        summary.summary_insights.length > 0
          ? `
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          Summary Insights
        </h2>
        <ul class="list">
          ${renderListItems(summary.summary_insights)}
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
        <h2 class="section-title">
          <span class="section-icon">😊</span>
          Meeting Sentiment
        </h2>
        <div class="sentiment-card ${sentimentConfig.class}">
          <div class="sentiment-emoji">${sentimentConfig.emoji}</div>
          <div class="sentiment-text">
            ${escapeHtml(summary.emotion_analysis.overall_sentiment.toUpperCase())}
          </div>
          <div class="sentiment-confidence">
            ${summary.emotion_analysis.overall_confidence}% Confidence
          </div>
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
        <h2 class="section-title">
          <span class="section-icon">📈</span>
          Meeting Health Score
        </h2>
        <div class="health-score">
          <div class="health-score-value">${summary.meeting_health_score.overall_score}</div>
          <div class="health-score-label">Overall Meeting Health / 100</div>
        </div>
        <div class="health-grid">
          <div class="health-metric">
            <div class="metric-value">${summary.meeting_health_score.engagement_score}</div>
            <div class="metric-label">Engagement</div>
          </div>
          <div class="health-metric">
            <div class="metric-value">${summary.meeting_health_score.productivity_score}</div>
            <div class="metric-label">Productivity</div>
          </div>
          <div class="health-metric">
            <div class="metric-value">${summary.meeting_health_score.collaboration_score}</div>
            <div class="metric-label">Collaboration</div>
          </div>
          <div class="health-metric">
            <div class="metric-value">${summary.meeting_health_score.clarity_score}</div>
            <div class="metric-label">Clarity</div>
          </div>
        </div>
      </div>
      `
          : ""
      }




      <!-- Footer -->
      <div class="footer">
        <div class="footer-attachment">
          <span style="font-size: 20px;">📎</span>
          <div>
            <strong>Complete meeting documentation attached</strong>
            <div style="font-size: 12px; opacity: 0.8;">Detailed PDF report included with this email</div>
          </div>
        </div>
        <p class="footer-text">
          This meeting summary was generated automatically by<br>
          <strong>LISN AI Documentation System</strong>
        </p>
        <p class="footer-copyright">
          © ${new Date().getFullYear()} LISN. All rights reserved.
        </p>
      </div>
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
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
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
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
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
                <strong>Important:</strong> This link will expire in 1 hour for security reasons.
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



