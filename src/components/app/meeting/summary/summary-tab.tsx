// components/app/meeting/summary-tab.tsx
"use client";


import { Button } from "@/components/ui/button";
import { Download, Mail, RefreshCw, FileText, ChevronDown, Users, X, Menu } from "lucide-react";
import { SummaryContent } from "@/components/app/meeting/summary/summary-content";
import { ExportService } from "@/lib/services/export-service";
import type { MeetingData, MeetingSummary } from "@/types/models/Meeting";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";


interface SummaryTabProps {
  meeting: MeetingData;
  isAnalyzing: boolean;
  onReanalyze: () => void;
}


interface EmailRecipient {
  email: string;
  name: string;
  isValid: boolean;
  isParticipant: boolean;
  source: "participant" | "manual";
}


export function SummaryTab({ meeting, isAnalyzing, onReanalyze }: SummaryTabProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [additionalEmails, setAdditionalEmails] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  // Check if current user is the meeting creator
  const isCreator = useMemo(() => {
    return user?.userId === meeting?.userId;
  }, [user?.userId, meeting?.userId]);


  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);


  // Extract ONLY participants with valid emails from meeting.participants
  const extractParticipantsWithEmails = useCallback((): EmailRecipient[] => {
    if (!meeting?.participants) return [];


    const uniqueEmails = new Set<string>();
    const participants: EmailRecipient[] = [];


    meeting.participants.forEach((participant) => {
      // Only include participants with valid emails
      if (participant.name && participant.email && validateEmail(participant.email)) {
        const emailKey = participant.email.toLowerCase().trim();


        // Avoid duplicates
        if (!uniqueEmails.has(emailKey)) {
          uniqueEmails.add(emailKey);
          participants.push({
            email: participant.email.trim(),
            name: participant.name,
            isValid: true,
            isParticipant: true,
            source: "participant",
          });
        }
      }
    });


    return participants;
  }, [meeting?.participants, validateEmail]);


  // Parse additional emails from text input
  const getAdditionalEmails = useCallback((): EmailRecipient[] => {
    if (!additionalEmails.trim()) return [];


    return additionalEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
      .map((email) => ({
        email,
        name: email.split("@")[0], // Use local part as name
        isValid: validateEmail(email),
        isParticipant: false,
        source: "manual" as const,
      }));
  }, [additionalEmails, validateEmail]);


  // All recipients (participants + additional emails)
  const allRecipients = useMemo((): EmailRecipient[] => {
    const participants = extractParticipantsWithEmails();
    const additional = getAdditionalEmails();


    // Combine and remove duplicates by email
    const emailMap = new Map<string, EmailRecipient>();


    [...participants, ...additional].forEach((recipient) => {
      const emailKey = recipient.email.toLowerCase();
      if (!emailMap.has(emailKey)) {
        emailMap.set(emailKey, recipient);
      } else {
        // Prefer participant emails over manual
        const existing = emailMap.get(emailKey)!;
        if (!existing.isParticipant && recipient.isParticipant) {
          emailMap.set(emailKey, recipient);
        }
      }
    });


    return Array.from(emailMap.values());
  }, [extractParticipantsWithEmails, getAdditionalEmails]);


  // Valid recipients count (only valid emails that are selected)
  const validRecipientCount = useMemo(() => {
    return allRecipients.filter((recipient) => recipient.isValid && selectedRecipients.has(recipient.email)).length;
  }, [allRecipients, selectedRecipients]);


  // Initialize selected recipients when modal opens
  useEffect(() => {
    if (showEmailModal) {
      // Auto-select all valid emails when modal opens
      const validEmails = allRecipients.filter((recipient) => recipient.isValid).map((recipient) => recipient.email);


      setSelectedRecipients(new Set(validEmails));
    }
  }, [showEmailModal, allRecipients]);


  const toggleRecipientSelection = (email: string) => {
    setSelectedRecipients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  };


  const selectAllRecipients = () => {
    const validEmails = allRecipients.filter((recipient) => recipient.isValid).map((recipient) => recipient.email);
    setSelectedRecipients(new Set(validEmails));
  };


  const deselectAllRecipients = () => {
    setSelectedRecipients(new Set());
  };


  const getStructuredSummary = useCallback((): MeetingSummary["meeting_summary"] => {
    if (meeting?.summary?.meeting_summary) {
      return meeting.summary.meeting_summary;
    }


    // Get only registered participants with emails
    const participants = extractParticipantsWithEmails().map((p) => p.name);
    const meetingDate = new Date(meeting?.time || new Date());


    return {
      title: meeting?.name || "Untitled Meeting",
      date: meetingDate.toISOString().split("T")[0],
      time: `${meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} WIB`,
      participants,
      key_points: ["Automatic analysis in progress..."],
      insights_decisions: [],
      action_items: [],
      summary_insights: ["Analysis pending"],
    };
  }, [meeting, extractParticipantsWithEmails]);


  const handleSendEmails = async () => {
    if (!meeting?.summary || validRecipientCount === 0) return;


    setIsSendingEmail(true);
    setEmailStatus("sending");
    setEmailMessage("");


    try {
      const structuredSummary = getStructuredSummary();
      const htmlContent = ExportService.generateDocumentHTML(meeting, structuredSummary);


      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);


      const pdfBase64 = await ExportService.generatePDFBase64(tempDiv);
      document.body.removeChild(tempDiv);


      if (!pdfBase64) {
        throw new Error("Failed to generate PDF");
      }


      const pdfData = pdfBase64.split(",")[1];


      // Get only selected and valid emails
      const selectedValidEmails = allRecipients.filter((recipient) => recipient.isValid && selectedRecipients.has(recipient.email)).map((recipient) => recipient.email);


      if (selectedValidEmails.length === 0) {
        throw new Error("No valid email addresses selected");
      }


      const response = await fetch(`/api/meetings/${meeting.id}/send-meeting-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmails: selectedValidEmails,
          pdfContent: pdfData,
        }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send emails");
      }


      const result = await response.json();


      setEmailStatus("success");
      setEmailMessage(result.message || `Meeting summary sent successfully to ${selectedValidEmails.length} recipients`);


      setTimeout(() => {
        setShowEmailModal(false);
        setAdditionalEmails("");
        setEmailStatus("idle");
        setSelectedRecipients(new Set());
      }, 3000);
    } catch (error: any) {
      console.error("Email sending failed:", error);
      setEmailStatus("error");
      setEmailMessage(error.message || "Failed to send emails. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };


  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailStatus("idle");
    setEmailMessage("");
    setAdditionalEmails("");
    setSelectedRecipients(new Set());
  };


  // Get participant count for display (only those with valid emails)
  const participantCount = useMemo(() => {
    return extractParticipantsWithEmails().length;
  }, [extractParticipantsWithEmails]);


  const exportToPDF = async () => {
    if (!meeting?.summary) return;


    setIsExporting(true);
    setShowExportMenu(false);
    setShowMobileMenu(false);


    try {
      const structuredSummary = getStructuredSummary();
      const htmlContent = ExportService.generateDocumentHTML(meeting, structuredSummary);


      // Create a temporary container
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);


      const success = await ExportService.exportToPDF(tempDiv, `meeting-documentation-${meeting.name}`);


      if (!success) {
        alert("Failed to generate PDF document. Please try again.");
      }


      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to generate PDF document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };


  const exportToWord = async () => {
    if (!meeting?.summary) return;


    setShowExportMenu(false);
    setShowMobileMenu(false);
    const structuredSummary = getStructuredSummary();
    const htmlContent = ExportService.generateDocumentHTML(meeting, structuredSummary);


    // Convert HTML to Word document
    const blob = new Blob(
      [
        `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Meeting Documentation - ${meeting.name}</title>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `,
      ],
      {
        type: "application/msword",
      }
    );


    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meeting-documentation-${meeting.name}-${new Date().toISOString().split("T")[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // Mobile menu actions
  const MobileActionsMenu = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-40 md:hidden">
      <div className="bg-white rounded-t-2xl w-full max-w-md mx-2 mb-2 shadow-xl">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-center text-gray-900">Meeting Actions</h3>
        </div>
        <div className="p-2 space-y-2">
          <Button onClick={onReanalyze} disabled={isAnalyzing || !meeting.transcripts?.length} variant="outline" size="lg" className="w-full justify-start h-14">
            <RefreshCw className={`w-5 h-5 mr-3 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Analyzing..." : "Re-analyze"}
          </Button>


          <Button onClick={exportToPDF} disabled={!meeting.summary || isExporting} variant="outline" size="lg" className="w-full justify-start h-14">
            <FileText className="w-5 h-5 mr-3 text-red-500" />
            {isExporting ? "Exporting..." : "Export as PDF"}
          </Button>


          <Button onClick={exportToWord} disabled={!meeting.summary} variant="outline" size="lg" className="w-full justify-start h-14">
            <FileText className="w-5 h-5 mr-3 text-blue-500" />
            Export as Word
          </Button>


          {/* Only show email button to creator */}
          {isCreator && (
            <Button
              onClick={() => {
                setShowMobileMenu(false);
                setShowEmailModal(true);
              }}
              disabled={!meeting.summary || isSendingEmail}
              variant="outline"
              size="lg"
              className="w-full justify-start h-14"
            >
              <Mail className="w-5 h-5 mr-3" />
              {isSendingEmail ? "Sending..." : "Email Summary"}
              {participantCount > 0 && <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{participantCount}</span>}
            </Button>
          )}


          <Button onClick={() => setShowMobileMenu(false)} variant="ghost" size="lg" className="w-full justify-center h-14 mt-2 border border-gray-200">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="p-4 md:p-6 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center sm:text-left">Meeting Summary</h3>


        {/* Desktop Actions */}
        <div className="hidden md:flex gap-2">
          <Button onClick={onReanalyze} disabled={isAnalyzing || !meeting.transcripts?.length} variant="outline" size="sm" className="hover:bg-blue-600 border-blue-200">
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Analyzing..." : "Re-analyze"}
          </Button>


          <div className="relative">
            <Button variant="outline" size="sm" disabled={!meeting.summary || isExporting} onClick={() => setShowExportMenu(!showExportMenu)} className="hover:bg-green-600 border-green-200">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Document"}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>


            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="py-1">
                  <button onClick={exportToPDF} disabled={isExporting} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100">
                    <FileText className="w-4 h-4 mr-3 text-red-500" />
                    <div className="text-left">
                      <div className="font-medium">Export as PDF</div>
                      <div className="text-xs text-gray-500">Professional document with all meeting details</div>
                    </div>
                  </button>
                  <button onClick={exportToWord} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    <FileText className="w-4 h-4 mr-3 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">Export as Word</div>
                      <div className="text-xs text-gray-500">Editable document format</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Only show email button to creator */}
          {isCreator && (
            <Button onClick={() => setShowEmailModal(true)} variant="outline" size="sm" disabled={!meeting.summary || isSendingEmail} className="hover:bg-orange-600 border-orange-200">
              <Mail className="w-4 h-4 mr-2" />
              {isSendingEmail ? "Sending..." : "Email Summary"}
              {participantCount > 0 && <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{participantCount}</span>}
            </Button>
          )}
        </div>


        {/* Mobile Actions Button */}
        <div className="flex md:hidden">
          <Button onClick={() => setShowMobileMenu(true)} variant="outline" size="sm" className="w-full">
            <Menu className="w-4 h-4 mr-2" />
            Actions
          </Button>
        </div>
      </div>


      {/* Mobile Actions Menu */}
      {showMobileMenu && <MobileActionsMenu />}


      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Meeting Summary</h3>
              <button onClick={handleCloseEmailModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" disabled={isSendingEmail}>
                <X className="w-5 h-5" />
              </button>
            </div>


            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Recipients Selection */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 inline mr-2" />
                    Select Recipients ({validRecipientCount} selected)
                  </label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllRecipients} className="text-xs h-8 flex-1 sm:flex-none">
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllRecipients} className="text-xs h-8 flex-1 sm:flex-none">
                      Deselect All
                    </Button>
                  </div>
                </div>


                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 max-h-60 overflow-y-auto">
                  {allRecipients.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {allRecipients.map((recipient, index) => (
                        <div
                          key={`${recipient.email}-${index}`}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedRecipients.has(recipient.email) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => toggleRecipientSelection(recipient.email)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedRecipients.has(recipient.email) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                              {selectedRecipients.has(recipient.email) && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>


                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1">
                                <span className="font-medium text-gray-900 truncate">{recipient.name}</span>
                                {recipient.isParticipant && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Participant</span>}
                              </div>
                              <p className="text-sm text-gray-600 truncate">{recipient.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No participants with email addresses found. Add manual emails below.</p>
                  )}
                </div>
              </div>


              {/* Additional Emails */}
              <div>
                <label htmlFor="additionalEmails" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Email Recipients
                </label>
                <textarea
                  id="additionalEmails"
                  value={additionalEmails}
                  onChange={(e) => setAdditionalEmails(e.target.value)}
                  placeholder="Enter additional email addresses, separated by commas&#10;Example: john@example.com, jane@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                  disabled={isSendingEmail}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas. Invalid emails will be highlighted.</p>
              </div>


              {/* Status Message */}
              {emailMessage && (
                <div
                  className={`p-3 sm:p-4 rounded-lg text-sm ${
                    emailStatus === "success" ? "bg-green-50 text-green-800 border border-green-200" : emailStatus === "error" ? "bg-red-50 text-red-800 border border-red-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {emailMessage}
                </div>
              )}
            </div>


            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <Button type="button" onClick={handleCloseEmailModal} variant="outline" className="flex-1 order-2 sm:order-1" disabled={isSendingEmail}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSendEmails} disabled={isSendingEmail || validRecipientCount === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2">
                {isSendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending to {validRecipientCount} recipients...
                  </span>
                ) : (
                  `Send to ${validRecipientCount} recipient${validRecipientCount !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}


      <SummaryContent meeting={meeting} />
    </div>
  );
}





