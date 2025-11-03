"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, Shield, Globe, Palette, Download, Trash2, Save, Eye, EyeOff, Languages, Volume2, User, CreditCard, Settings, CheckCircle, AlertCircle, Zap, Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";

interface SettingsState {
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  meetingReminders: boolean;
  transcriptReady: boolean;
  summaryReady: boolean;

  // Privacy Settings
  showOnlineStatus: boolean;
  allowJoinRequests: boolean;
  publicProfile: boolean;
  dataCollection: boolean;

  // Appearance
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;

  // Meeting Preferences
  defaultLanguage: string;
  autoRecord: "yes" | "no" | "ask";
  defaultVisibility: "public" | "private";
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState<SettingsState>({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    meetingReminders: true,
    transcriptReady: true,
    summaryReady: true,

    // Privacy Settings
    showOnlineStatus: true,
    allowJoinRequests: false,
    publicProfile: false,
    dataCollection: true,

    // Appearance
    theme: "light",
    language: "english",
    fontSize: "medium",
    compactMode: false,

    // Meeting Preferences
    defaultLanguage: "english",
    autoRecord: "ask",
    defaultVisibility: "public",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Settings Save State
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calculate password strength score (0-100)
    let strengthScore = 0;
    if (password.length >= minLength) strengthScore += 25;
    if (hasUpperCase) strengthScore += 25;
    if (hasLowerCase) strengthScore += 25;
    if (hasNumbers) strengthScore += 15;
    if (hasSpecialChar) strengthScore += 10;

    return {
      isValid: password.length >= 6, // Minimum requirement only
      strengthScore,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      },
      strengthLevel: strengthScore >= 80 ? "strong" : strengthScore >= 60 ? "good" : strengthScore >= 40 ? "fair" : "weak",
    };
  };

  // In your settings page component
  const handleUpdatePassword = async () => {
    setPasswordLoading(true);
    setPasswordMessage(null);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all password fields." });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      setPasswordLoading(false);
      return;
    }

    // Only require minimum length, other requirements are recommendations
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long." });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: "success", text: data.message || "Password updated successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordMessage({ type: "error", text: data.message || "Failed to update password." });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "An error occurred while updating password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    setSaveMessage(null);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveMessage({ type: "success", text: "Settings saved successfully!" });

        // Apply theme immediately
        if (settings.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else if (settings.theme === "light") {
          document.documentElement.classList.remove("dark");
        }
      } else {
        setSaveMessage({ type: "error", text: "Failed to save settings." });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "An error occurred while saving settings." });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExportData = () => {
    alert("Data export started. You will receive an email when it's ready.");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion process started.");
    }
  };

  const passwordValidation = validatePassword(passwordData.newPassword);
  const storageUsed = 2.5; // GB
  const storageTotal = 10; // GB
  const storagePercentage = (storageUsed / storageTotal) * 100;

  // Get strength level color
  const getStrengthColor = (level: string) => {
    switch (level) {
      case "strong":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "fair":
        return "text-yellow-600";
      case "weak":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Get strength level text
  const getStrengthText = (level: string) => {
    switch (level) {
      case "strong":
        return "Strong";
      case "good":
        return "Good";
      case "fair":
        return "Fair";
      case "weak":
        return "Weak";
      default:
        return "Very Weak";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-3">Settings & Preferences</h1>
            <p className="text-lg sm:text-lg text-gray-600 dark:text-gray-400">Customize your LISN experience and account settings</p>
          </div>
          <Button onClick={handleSaveSettings} disabled={saveLoading} className="gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-lg">
            <Save className="w-4 h-4" />
            {saveLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`p-4 rounded-lg border ${
              saveMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {saveMessage.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {saveMessage.text}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab - Moved to top since we're focusing on password update */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Password Message */}
                  {passwordMessage && (
                    <div
                      className={`p-3 rounded-lg ${
                        passwordMessage.type === "success"
                          ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        {passwordMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {passwordMessage.text}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-white dark:bg-gray-700"
                        placeholder="Enter current password"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-white dark:bg-gray-700"
                        placeholder="Enter new password"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Password Strength:</span>
                          <span className={`text-sm font-semibold ${getStrengthColor(passwordValidation.strengthLevel)}`}>{getStrengthText(passwordValidation.strengthLevel)}</span>
                        </div>

                        {/* Strength Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordValidation.strengthLevel === "weak"
                                ? "bg-red-500 w-1/4"
                                : passwordValidation.strengthLevel === "fair"
                                ? "bg-yellow-500 w-1/2"
                                : passwordValidation.strengthLevel === "good"
                                ? "bg-blue-500 w-3/4"
                                : "bg-green-500 w-full"
                            }`}
                          />
                        </div>

                        {/* Password Recommendations */}
                        <div className="space-y-1 text-sm">
                          <p className="font-medium text-gray-700 dark:text-gray-300">For better security, we recommend:</p>
                          {[
                            { label: "At least 8 characters", met: passwordValidation.requirements.minLength, required: false },
                            { label: "One uppercase letter", met: passwordValidation.requirements.hasUpperCase, required: false },
                            { label: "One lowercase letter", met: passwordValidation.requirements.hasLowerCase, required: false },
                            { label: "One number", met: passwordValidation.requirements.hasNumbers, required: false },
                            { label: "One special character", met: passwordValidation.requirements.hasSpecialChar, required: false },
                          ].map((req, index) => (
                            <div key={index} className={`flex items-center gap-2 ${req.met ? "text-green-600" : "text-gray-500"}`}>
                              {req.met ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              <span className={req.met ? "line-through" : ""}>{req.label}</span>
                              {!req.required && <span className="text-xs text-gray-400">(recommended)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-white dark:bg-gray-700"
                        placeholder="Confirm new password"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && <p className="text-sm text-red-600">Passwords do not match</p>}
                  </div>

                  <Button
                    onClick={handleUpdatePassword}
                    disabled={passwordLoading || passwordData.newPassword.length < 6 || passwordData.newPassword !== passwordData.confirmPassword}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  >
                    {passwordLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Account Information
                    </CardTitle>
                    <CardDescription>Your current plan and usage details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold">Current Plan</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pro Plan</p>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Storage Used</span>
                        <span>
                          {storageUsed} GB of {storageTotal} GB
                        </span>
                      </div>
                      <Progress value={storagePercentage} className="h-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">{storageTotal - storageUsed} GB remaining</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold">Next Billing Date</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">March 15, 2025</p>
                      </div>
                      <Button variant="outline">Manage Plan</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Account Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                        <span>Last password change</span>
                        <span className="font-medium">2 weeks ago</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                        <span>Two-factor authentication</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          Not enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                        <span>Active sessions</span>
                        <span className="font-medium">1 device</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified about your meetings and activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { id: "email-notifications", label: "Email Notifications", description: "Receive notifications via email", value: settings.emailNotifications },
                    { id: "push-notifications", label: "Push Notifications", description: "Receive browser push notifications", value: settings.pushNotifications },
                    { id: "meeting-reminders", label: "Meeting Reminders", description: "Get reminders before meetings start", value: settings.meetingReminders },
                    { id: "transcript-ready", label: "Transcript Ready", description: "Notify when transcripts are available", value: settings.transcriptReady },
                    { id: "summary-ready", label: "Summary Ready", description: "Notify when AI summaries are ready", value: settings.summaryReady },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl backdrop-blur-sm">
                      <div className="space-y-1">
                        <Label htmlFor={item.id} className="text-base font-semibold">
                          {item.label}
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.value}
                        onCheckedChange={(checked) => setSettings({ ...settings, [item.id.split("-")[0] + item.id.split("-")[1].charAt(0).toUpperCase() + item.id.split("-")[1].slice(1)]: checked })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Quick Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meeting Reminder Time</Label>
                      <Select defaultValue="15">
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quiet Hours</Label>
                      <Select defaultValue="22:00-08:00">
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="22:00-08:00">10:00 PM - 8:00 AM</SelectItem>
                          <SelectItem value="23:00-07:00">11:00 PM - 7:00 AM</SelectItem>
                          <SelectItem value="00:00-06:00">12:00 AM - 6:00 AM</SelectItem>
                          <SelectItem value="none">No quiet hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Volume2 className="w-4 h-4 text-green-600" />
                      Notification Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Active Notifications:</span>
                        <span className="font-semibold">{[settings.emailNotifications, settings.pushNotifications, settings.meetingReminders, settings.transcriptReady, settings.summaryReady].filter(Boolean).length}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Primary Channel:</span>
                        <span className="font-semibold text-blue-600">Email</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    Privacy & Visibility
                  </CardTitle>
                  <CardDescription>Control your visibility and how others interact with you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { id: "show-online-status", label: "Show Online Status", description: "Let others see when you're online", value: settings.showOnlineStatus },
                    { id: "allow-join-requests", label: "Allow Join Requests", description: "Allow others to request to join your meetings", value: settings.allowJoinRequests },
                    { id: "public-profile", label: "Public Profile", description: "Make your profile visible to other users", value: settings.publicProfile },
                    { id: "data-collection", label: "Analytics Data", description: "Help improve LISN by sharing usage data", value: settings.dataCollection },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl backdrop-blur-sm">
                      <div className="space-y-1">
                        <Label htmlFor={item.id} className="text-base font-semibold">
                          {item.label}
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.value}
                        onCheckedChange={(checked) => setSettings({ ...settings, [item.id.split("-")[0] + item.id.split("-")[1].charAt(0).toUpperCase() + item.id.split("-")[1].slice(1)]: checked })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-600" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold">Export Your Data</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Download a copy of your meeting data</p>
                      </div>
                      <Button variant="outline" onClick={handleExportData} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100">Delete Account</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Privacy Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Profile Visibility:</span>
                        <Badge variant={settings.publicProfile ? "default" : "secondary"} className={settings.publicProfile ? "bg-green-100 text-green-700" : ""}>
                          {settings.publicProfile ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Online Status:</span>
                        <Badge variant={settings.showOnlineStatus ? "default" : "secondary"} className={settings.showOnlineStatus ? "bg-blue-100 text-blue-700" : ""}>
                          {settings.showOnlineStatus ? "Visible" : "Hidden"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Data Sharing:</span>
                        <Badge variant={settings.dataCollection ? "default" : "secondary"} className={settings.dataCollection ? "bg-purple-100 text-purple-700" : ""}>
                          {settings.dataCollection ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Interface Settings
                  </CardTitle>
                  <CardDescription>Customize how LISN looks and feels to you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-base font-semibold">
                      Theme
                    </Label>
                    <Select value={settings.theme} onValueChange={(value: "light" | "dark" | "system") => setSettings({ ...settings, theme: value })}>
                      <SelectTrigger className="bg-white dark:bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-base font-semibold">
                      Language
                    </Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                      <SelectTrigger className="bg-white dark:bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="indonesian">Indonesian</SelectItem>
                        <SelectItem value="korean">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size" className="text-base font-semibold">
                      Font Size
                    </Label>
                    <Select value={settings.fontSize} onValueChange={(value: "small" | "medium" | "large") => setSettings({ ...settings, fontSize: value })}>
                      <SelectTrigger className="bg-white dark:bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                    <div className="space-y-1">
                      <Label htmlFor="compact-mode" className="text-base font-semibold">
                        Compact Mode
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Use denser spacing for more content</p>
                    </div>
                    <Switch id="compact-mode" checked={settings.compactMode} onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-5 h-5 text-blue-600" />
                      Meeting Preferences
                    </CardTitle>
                    <CardDescription>Set defaults for your meetings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="default-language">Default Meeting Language</Label>
                      <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}>
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="indonesian">Indonesian</SelectItem>
                          <SelectItem value="korean">Korean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auto-record">Auto-record Meetings</Label>
                      <Select value={settings.autoRecord} onValueChange={(value: "yes" | "no" | "ask") => setSettings({ ...settings, autoRecord: value })}>
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="ask">Ask each time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-visibility">Default Visibility</Label>
                      <Select value={settings.defaultVisibility} onValueChange={(value: "public" | "private") => setSettings({ ...settings, defaultVisibility: value })}>
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg border-2 border-dashed ${settings.theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className={`text-center ${settings.fontSize === "small" ? "text-sm" : settings.fontSize === "large" ? "text-lg" : "text-base"}`}>
                        <p className="font-semibold">Sample Text</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">This is how your interface will look</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
