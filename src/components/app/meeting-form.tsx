'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MeetingFormProps {
  onMeetingCreated: (meetingId: string) => void;
}

export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
  const [name, setName] = useState('');
  const [time, setTime] = useState(getDefaultTime());
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, time, isPublic }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create meeting';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.meetingId) {
        onMeetingCreated(data.meetingId);
      } else if (data.id) {
        onMeetingCreated(data.id);
      } else {
        throw new Error('No meeting ID returned from server');
      }

      setName('');
      setTime(getDefaultTime());
      setIsPublic(false);

    } catch (err: any) {
      console.error('Meeting creation error:', err);
      setError(err.message || 'Failed to create meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  function getDefaultTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Team Standup, Project Review..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Time *
        </label>
        <input
          id="time"
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="is-public" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isLoading}
          />
          <span>Make this a public meeting</span>
        </Label>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !name || !time}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Meeting Room...
          </span>
        ) : (
          'Create Meeting Room'
        )}
      </button>
    </form>
  );
}
