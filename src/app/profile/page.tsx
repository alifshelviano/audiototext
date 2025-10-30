'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/app/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/AuthProvider';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  Shield,
  Globe,
  Users,
  FileText
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Product designer with 5+ years of experience. Passionate about creating beautiful and functional interfaces.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.design',
    company: 'Acme Inc.'
  });

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      bio: 'Product designer with 5+ years of experience. Passionate about creating beautiful and functional interfaces.',
      location: 'San Francisco, CA',
      website: 'https://johndoe.design',
      company: 'Acme Inc.'
    });
    setIsEditing(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const stats = [
    { label: 'Meetings Created', value: '24', icon: Users },
    { label: 'Transcripts Generated', value: '156', icon: FileText },
    { label: 'Public Meetings', value: '8', icon: Globe },
    { label: 'Private Meetings', value: '16', icon: Shield }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Profile
            </h1>
            <p className="text-xl text-gray-600">
              Manage your personal information and account settings
            </p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader className="text-center pb-4">
                    <div className="relative inline-block">
                      <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-lg">
                        <AvatarImage src={user?.avatar} alt="Profile" />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getUserInitials(profileData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-2xl mt-4">{profileData.name}</CardTitle>
                    <CardDescription className="text-lg">{profileData.email}</CardDescription>
                    <div className="flex justify-center gap-2 mt-3">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        Pro Member
                      </Badge>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Joined January 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>{profileData.location}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Bio</h4>
                      <p className="text-sm text-gray-600">{profileData.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Edit Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Statistics</CardTitle>
                    <CardDescription>
                      Overview of your meeting activity and usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="p-3 bg-blue-50 rounded-xl inline-flex items-center justify-center mb-3">
                            <stat.icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent meetings and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Team Meeting #{item}</p>
                        <p className="text-sm text-gray-600">Meeting completed • 2 hours ago</p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your meeting preferences and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email updates about your meetings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Language Preferences</p>
                      <p className="text-sm text-gray-600">Set your preferred language for meetings</p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}