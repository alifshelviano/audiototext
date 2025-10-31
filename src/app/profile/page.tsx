// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/app/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { User, Mail, Calendar, Edit3, Save, X, MapPin, Globe, Building, FileText, Users, Shield, BarChart3 } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  meetingsCreated: number;
  transcriptsGenerated: number;
  publicMeetings: number;
  privateMeetings: number;
  analyzedMeetings: number;
  totalParticipants: number;
  avgParticipants: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    _id: "",
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    company: "",
    createdAt: "",
    updatedAt: "",
  });
  const [userStats, setUserStats] = useState<UserStats>({
    meetingsCreated: 0,
    transcriptsGenerated: 0,
    publicMeetings: 0,
    privateMeetings: 0,
    analyzedMeetings: 0,
    totalParticipants: 0,
    avgParticipants: "0",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserData();
      fetchUserStats();
    }
  }, [status, session]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${session?.user?.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setProfileData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If API fails, use session data as fallback
      if (session?.user) {
        setProfileData({
          _id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          bio: "",
          location: "",
          website: "",
          company: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`/api/users/${session?.user?.id}/stats`);

      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      setSaveLoading(true);
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const updatedUser = await response.json();
      setProfileData(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    fetchUserData();
    setIsEditing(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statsCards = [
    {
      label: "Total Meetings",
      value: userStats.meetingsCreated,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Transcripts",
      value: userStats.transcriptsGenerated,
      icon: FileText,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Public Meetings",
      value: userStats.publicMeetings,
      icon: Globe,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Private Meetings",
      value: userStats.privateMeetings,
      icon: Shield,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const analyticsCards = [
    {
      label: "Analyzed Meetings",
      value: userStats.analyzedMeetings,
      description: "With AI summaries",
      icon: BarChart3,
      color: "from-teal-500 to-teal-600",
    },
    {
      label: "Total Participants",
      value: userStats.totalParticipants,
      description: "Across all meetings",
      icon: Users,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      label: "Avg Participants",
      value: userStats.avgParticipants,
      description: "Per meeting",
      icon: User,
      color: "from-pink-500 to-pink-600",
    },
  ];

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Please sign in to view your profile.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Profile Settings</h1>
            <p className="text-xl text-gray-600">Manage your personal information and account preferences</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={saveLoading} className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Save className="w-4 h-4" />
                  {saveLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saveLoading} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="text-center relative z-10">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-2xl">
                    <AvatarImage src={profileData.avatar} alt="Profile" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">{getUserInitials(profileData.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl mt-6 text-gray-900">{profileData.name}</CardTitle>
                <CardDescription className="text-lg flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </CardDescription>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    Active Member
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Joined {profileData.createdAt ? formatDate(profileData.createdAt) : "Unknown"}</span>
                </div>

                {profileData.location && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>{profileData.location}</span>
                  </div>
                )}

                {profileData.company && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span>{profileData.company}</span>
                  </div>
                )}

                {profileData.website && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                    <Globe className="w-4 h-4 text-green-600" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profileData.website}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200/50">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">About</h4>
                  <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-lg backdrop-blur-sm">{profileData.bio || "No bio provided yet. Tell us about yourself!"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Meeting Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsCards.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{stat.label}</p>
                        <p className="text-xs text-gray-600">{stat.description}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{statsLoading ? "..." : stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Edit Form & Statistics */}
          <div className="xl:col-span-2 space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{statsLoading ? "..." : stat.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Profile Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b">
                <CardTitle className="text-xl text-gray-900">Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className={`h-12 ${!isEditing ? "bg-gray-50 border-gray-200" : "border-gray-300"}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className={`h-12 ${!isEditing ? "bg-gray-50 border-gray-200" : "border-gray-300"}`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    value={profileData.bio || ""}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${!isEditing ? "bg-gray-50 border-gray-200 text-gray-600" : "border-gray-300 bg-white"}`}
                    placeholder="Tell us about yourself, your interests, or your professional background..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profileData.location || ""}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                      className={`h-12 ${!isEditing ? "bg-gray-50 border-gray-200" : "border-gray-300"}`}
                      placeholder="Your city or country"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={profileData.company || ""}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      disabled={!isEditing}
                      className={`h-12 ${!isEditing ? "bg-gray-50 border-gray-200" : "border-gray-300"}`}
                      placeholder="Your company or organization"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website || ""}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    disabled={!isEditing}
                    className={`h-12 ${!isEditing ? "bg-gray-50 border-gray-200" : "border-gray-300"}`}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
