"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function JoinMeetingForm({ onJoin }: { onJoin: (name: string, email: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (name && email) {
      onJoin(name, email);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <Button onClick={handleJoin} className="w-full">
              Join as Guest
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-600">or</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
