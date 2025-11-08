// lib/meeting-analysis.ts
"use server";


import { getMeeting, generateMeetingSummary, updateMeetingSummary } from "@/lib/services/meeting-service";
import { summarizeTranscribedText } from "@/ai/flows/summarize-transcribed-text";
import { notifyActionItemAssignees } from "./notification-service";
import clientPromise from "@/lib/database/mongodb";
import { getSocketIOInstanceSafe, isSocketIOInitialized } from "@/lib/socket";


export async function analyzeMeeting(meetingId: string): Promise<{
  success: boolean;
  summary?: any;
  error?: string;
}> {
  try {
    // Get meeting data
    const meeting = await getMeeting({ meetingId });
    if (!meeting) {
      return { success: false, error: "Meeting not found" };
    }


    // Check if we have transcripts
    if (!meeting.transcripts || meeting.transcripts.length === 0) {
      return { success: false, error: "No transcripts available for analysis" };
    }


    // Option 1: Use the existing generateMeetingSummary function (if it supports language)
    try {
      const result = await generateMeetingSummary({
        meetingId,
        transcripts: meeting.transcripts,
        language: meeting.language, // Pass the meeting's language
      });


      if (result.success) {
        // Trigger action item notifications if summary was generated successfully
        await triggerActionItemNotifications(meetingId, meeting, result.summary);
        return result;
      }
      // If the existing function fails, fall through to Option 2
    } catch (error) {
      console.warn("generateMeetingSummary failed, trying direct analysis:", error);
    }


    // Option 2: Direct analysis with language support
    const combinedTranscript = meeting.transcripts.map((t: any) => `${t.name}: ${t.transcript}`).join("\n\n");


    // Format meeting date and time
    const meetingDate = new Date(meeting.time);
    const formattedDate = meetingDate.toISOString().split("T")[0];
    const formattedTime = meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


    // Call the Gemini flow with language parameter and required fields
    const result = await summarizeTranscribedText({
      transcribedText: combinedTranscript,
      language: meeting.language,
      maxTranscriptLength: 50000, // Add this required parameter
      meetingDate: formattedDate,
      meetingTime: formattedTime,
    });


    // Parse and save the summary
    let parsedSummary;
    try {
      parsedSummary = JSON.parse(result.summary);
    } catch (parseError) {
      console.error("Failed to parse summary JSON:", parseError);
      return {
        success: false,
        error: "Failed to parse analysis results",
      };
    }


    const updateResult = await updateMeetingSummary({
      meetingId,
      summary: parsedSummary,
    });


    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || "Failed to save analysis results",
      };
    }


    // Trigger action item notifications after successful analysis
    await triggerActionItemNotifications(meetingId, meeting, parsedSummary);


    return {
      success: true,
      summary: parsedSummary,
    };
  } catch (error) {
    console.error("Error in meeting analysis service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed",
    };
  }
}


// Helper function to trigger action item notifications
async function triggerActionItemNotifications(meetingId: string, meeting: any, summary: any): Promise<void> {
  try {
    // Check if we have action items in the summary
    const actionItems = summary?.meeting_summary?.action_items || summary?.action_items;


    if (actionItems && Array.isArray(actionItems) && actionItems.length > 0) {
      console.log(`🔔 Found ${actionItems.length} action items to notify`);


      // Create notifications for assignees
      await notifyActionItemAssignees(meetingId, meeting.name, actionItems, meeting.participants || []);


      // Only emit Socket.IO events if initialized
      if (!isSocketIOInitialized()) {
        console.warn("⚠️ Socket.IO not initialized - skipping real-time action item notifications");
        return;
      }


      const io = getSocketIOInstanceSafe();
      if (!io) {
        console.warn("⚠️ Socket.IO instance unavailable - skipping real-time notifications");
        return;
      }


      for (const item of actionItems) {
        const assignedTo = item.assigned_to;
        if (assignedTo && meeting.participants) {
          // Try to find participant by name or email
          const participant = meeting.participants.find((p: any) => p.name?.toLowerCase() === assignedTo.toLowerCase() || p.email?.toLowerCase() === assignedTo.toLowerCase());


          if (participant && participant.email) {
            try {
              const client = await clientPromise;
              const db = client.db();
              const user = await db.collection("users").findOne({
                email: participant.email.toLowerCase(),
              });


              if (user) {
                io.to(`user-${user._id.toString()}`).emit("new-notification", {
                  type: "action_item",
                  title: "New Action Item Assigned",
                  message: `You have been assigned: "${item.task}"`,
                  meetingId,
                  meetingName: meeting.name,
                  actionItem: {
                    task: item.task,
                    deadline: item.deadline,
                    assignedTo: item.assigned_to,
                  },
                  timestamp: new Date().toISOString(),
                });
                console.log(`✅ Sent real-time notification for action item to ${participant.email}`);
              } else {
                console.log(`ℹ️ User not found for email: ${participant.email}`);
              }
            } catch (userError) {
              console.error(`Failed to send notification for ${participant.email}:`, userError);
              // Continue with other participants
            }
          } else {
            console.log(`ℹ️ No participant found for assigned_to: ${assignedTo}`);
          }
        }
      }
    } else {
      console.log("ℹ️ No action items found in summary to notify");
    }
  } catch (notificationError) {
    // Don't fail the analysis if notifications fail
    console.error("❌ Failed to send action item notifications:", notificationError);
  }
}


export async function shouldAutoAnalyze(meetingId: string): Promise<boolean> {
  try {
    const meeting = await getMeeting({ meetingId });
    if (!meeting) {
      console.log("❌ Meeting not found for auto-analyze check");
      return false;
    }


    // Check if we have transcripts to analyze
    if (!meeting.transcripts || meeting.transcripts.length === 0) {
      console.log("ℹ️ No transcripts available for auto-analyze");
      return false;
    }


    // Auto-analyze if no summary exists
    if (!meeting.summary) {
      console.log("✅ No existing summary - triggering auto-analyze");
      return true;
    }


    // Check if new transcripts have been added since last analysis
    if (meeting.lastAnalyzed && meeting.transcripts.length > 0) {
      const latestTranscript = meeting.transcripts[meeting.transcripts.length - 1];
      const lastAnalysisTime = new Date(meeting.lastAnalyzed);
      const latestTranscriptTime = new Date(latestTranscript.createdAt);


      console.log("🔍 Checking transcript timestamps:");
      console.log(`   Last analysis: ${lastAnalysisTime.toISOString()}`);
      console.log(`   Latest transcript: ${latestTranscriptTime.toISOString()}`);


      if (latestTranscriptTime > lastAnalysisTime) {
        console.log("✅ New transcripts detected - triggering auto-analyze");
        return true;
      } else {
        console.log("ℹ️ No new transcripts since last analysis");
      }
    }


    // Check if summary structure is incomplete or malformed
    if (meeting.summary && typeof meeting.summary === "object") {
      const summary = meeting.summary;


      // If summary exists but is missing critical sections, re-analyze
      if (!summary.meeting_summary || !summary.meeting_summary.key_points || summary.meeting_summary.key_points.length === 0) {
        console.log("✅ Incomplete summary detected - triggering auto-analyze");
        return true;
      }
    }


    console.log("ℹ️ Analysis is up to date - no auto-analyze needed");
    return false;
  } catch (error) {
    console.error("❌ Error checking auto-analysis:", error);
    return false;
  }
}



