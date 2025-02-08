import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Video, Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { meetingsApi } from '../services/api';

interface Meeting {
  _id: string;
  subject: string;
  dateTime: string;
  status: string;
  meetLink: string;
  sourceEmailId: {
    subject: string;
    sender: string;
    analysis: {
      urgencyLevel: string;
    };
  };
}

interface Email {
  _id: string;
  subject: string;
  sender: string;
  analysis: {
    urgencyLevel: string;
    requiredFollowUpActions: string[];
  };
}

interface SyncResponse {
  success: boolean;
  summary: {
    totalFound: number;
    processed: number;
    skipped: number;
    errors: number;
  };
}

const API_BASE_URL = 'http://localhost:5000/api';

const MeetingsDashboard = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [highPriorityEmails, setHighPriorityEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [meetings, emails] = await Promise.all([
        meetingsApi.getMeetings(),
        meetingsApi.getHighPriorityEmails()
      ]);

      setMeetings(meetings);
      setHighPriorityEmails(emails);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetProcessingStatus = async () => {
    try {
      const response = await meetingsApi.resetProcessingStatus();
      setSyncStatus('Processing status reset. Please sync emails now.');
    } catch (err) {
      console.error('Error resetting status:', err);
      setError('Failed to reset processing status.');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncStatus('Starting sync...');

      const response = await meetingsApi.syncEmails();
      
      if (response.success) {
        setSyncStatus(`Sync completed: Found ${response.summary.totalFound} emails, ` +
          `Processed ${response.summary.processed}, ` +
          `Skipped ${response.summary.skipped}, ` +
          `Errors ${response.summary.errors}`);
        await fetchDashboardData();
      } else {
        setError('Sync completed with errors. Please check the logs.');
      }
    } catch (err) {
      console.error('Error during sync:', err);
      setError('Failed to sync emails. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meetings Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={resetProcessingStatus}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Sync Status
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Emails'}
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {syncStatus}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Meetings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length > 0 ? (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting._id} className="border p-4 rounded-lg">
                    <h3 className="font-semibold">{meeting.subject}</h3>
                    <p className="text-gray-600">
                      {new Date(meeting.dateTime).toLocaleString()}
                    </p>
                    {meeting.meetLink && (
                      <a
                        href={meeting.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-500 hover:underline mt-2"
                      >
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming meetings.</p>
            )}
          </CardContent>
        </Card>

        {/* High-Priority Emails Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              High-Priority Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highPriorityEmails.length > 0 ? (
              <div className="space-y-4">
                {highPriorityEmails.map((email) => (
                  <div key={email._id} className="border p-4 rounded-lg">
                    <h3 className="font-semibold">{email.subject}</h3>
                    <p className="text-gray-600">From: {email.sender}</p>
                    {email.analysis.requiredFollowUpActions.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Follow-up Actions:</p>
                        <ul className="list-disc list-inside">
                          {email.analysis.requiredFollowUpActions.map((action, index) => (
                            <li key={index} className="text-gray-600">{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No high-priority emails.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeetingsDashboard;
