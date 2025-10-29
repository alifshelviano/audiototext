import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMeeting } from "@/app/meetings";
import { analyzeMeeting, shouldAutoAnalyze } from "@/lib/meeting-analysis";
import type { MeetingData } from "@/models/Meeting";

export function useMeetingData(meetingId: string | null) {
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "error">("idle");
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const fetchMeetingData = useCallback(async () => {
    if (!meetingId) return;

    try {
      const data = await getMeeting({ meetingId });
      if (data) {
        setMeeting(data);
        if (data.lastAnalyzed) {
          setLastAnalysisTime(new Date(data.lastAnalyzed));
        }
        setAnalysisStatus(data.summary ? "success" : "idle");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
      setAnalysisStatus("error");
    }
  }, [meetingId, router]);

  const handleAutoAnalyze = useCallback(async () => {
    if (!meetingId || !meeting?.transcripts?.length) return;

    setIsAnalyzing(true);
    setAnalysisStatus("analyzing");

    try {
      const result = await analyzeMeeting(meetingId);

      if (result.success) {
        setAnalysisStatus("success");
        setLastAnalysisTime(new Date());
        await fetchMeetingData();
      } else {
        setAnalysisStatus("error");
        console.error("Analysis failed:", result.error);
      }
    } catch (error) {
      console.error("Error analyzing meeting:", error);
      setAnalysisStatus("error");
    } finally {
      setIsAnalyzing(false);
    }
  }, [meetingId, meeting?.transcripts?.length, fetchMeetingData]);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingData().finally(() => setLoading(false));
    }
  }, [meetingId, fetchMeetingData]);

  useEffect(() => {
    const autoAnalyzeIfNeeded = async () => {
      if (meeting?.transcripts?.length && meeting.transcripts.length > 0 && !meeting.summary) {
        const shouldAnalyze = await shouldAutoAnalyze(meeting.id);
        if (shouldAnalyze) {
          handleAutoAnalyze();
        }
      }
    };

    autoAnalyzeIfNeeded();
  }, [meeting?.transcripts?.length, meeting?.summary, meeting?.id, handleAutoAnalyze]);

  return {
    meeting,
    loading,
    analysisStatus,
    lastAnalysisTime,
    isAnalyzing,
    fetchMeetingData,
    handleAutoAnalyze,
  };
}
