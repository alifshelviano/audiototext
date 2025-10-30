'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/app/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  Shield,
  Globe,
  Palette,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Languages,
  Volume2
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    meetingReminders: true,
    transcriptReady: true,
    
    // Privacy Settings
    showOnlineStatus: true,
    allowJoinRequests: false,
    publicProfile: false,
    
    // Appearance
    theme: 'light',
    language: 'english',
    fontSize: 'medium',
    
    // Account
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveSettings = () => {
    // Here you would typically make an API call to save settings
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    // Export user data
    alert('Data export started. You will receive an email when it\'s ready.');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete account logic
      alert('Account deletion process started.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Settings
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Globe className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about your meetings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                      <p className="text-sm text-gray-600">Get reminders before meetings start</p>
                    </div>
                    <Switch
                      id="meeting-reminders"
                      checked={settings.meetingReminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, meetingReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="transcript-ready">Transcript Ready Alerts</Label>
                      <p className="text-sm text-gray-600">Notify when transcripts are available</p>
                    </div>
                    <Switch
                      id="transcript-ready"
                      checked={settings.transcriptReady}
                      onCheckedChange={(checked) => setSettings({ ...settings, transcriptReady: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Schedule</CardTitle>
                  <CardDescription>
                    Set your preferred notification times
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <Select defaultValue="22:00-08:00">
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Meeting Reminder Time</Label>
                    <Select defaultValue="15">
                      <SelectTrigger>
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your visibility and data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="online-status">Show Online Status</Label>
                      <p className="text-sm text-gray-600">Let others see when you're online</p>
                    </div>
                    <Switch
                      id="online-status"
                      checked={settings.showOnlineStatus}
                      onCheckedChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="join-requests">Allow Join Requests</Label>
                      <p className="text-sm text-gray-600">Allow others to request to join your meetings</p>
                    </div>
                    <Switch
                      id="join-requests"
                      checked={settings.allowJoinRequests}
                      onCheckedChange={(checked) => setSettings({ ...settings, allowJoinRequests: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-profile">Public Profile</Label>
                      <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      id="public-profile"
                      checked={settings.publicProfile}
                      onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>
                    Manage your data and privacy controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Export Your Data</p>
                      <p className="text-sm text-gray-600">Download a copy of your meeting data</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how LISN looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value) => setSettings({ ...settings, fontSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Meeting Preferences</CardTitle>
                  <CardDescription>
                    Set defaults for your meetings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-language">Default Meeting Language</Label>
                    <Select defaultValue="english">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto-record">Auto-record Meetings</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="ask">Ask each time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={settings.currentPassword}
                        onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
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
                        value={settings.newPassword}
                        onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={settings.confirmPassword}
                        onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full">Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your current plan and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-gray-600">Pro Plan</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Storage Used</p>
                      <p className="text-sm text-gray-600">2.5 GB of 10 GB</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Next Billing Date</p>
                      <p className="text-sm text-gray-600">March 15, 2024</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}