// 'use server';

// import {summarizeTranscribedText} from '@/ai/flows/summarize-transcribed-text';
// import clientPromise from '@/lib/mongodb';
// import {InsertOneResult, ObjectId, Document} from 'mongodb';

// // Define interfaces for type safety
// export interface Transcript {
//   name: string;
//   transcript: string;
//   summary?: string;
//   createdAt: Date;
// }

// export interface Meeting extends Document {
//   name: string;
//   time: string;
//   createdAt: Date;
//   transcripts: Transcript[];
//   summary?: string;
//   summaryCreatedAt?: Date;
// }

// export async function createMeeting(meetingData: {
//   name: string;
//   time: string;
// }): Promise<{insertedId: string}> {
//   const client = await clientPromise;
//   const db = client.db();
//   const meetingsCollection = db.collection<Meeting>('meetings');

//   // Create a new meeting with an empty transcripts array
//   const result = await meetingsCollection.insertOne({
//     ...meetingData,
//     createdAt: new Date(),
//     transcripts: [],
//   });
//   return {insertedId: result.insertedId.toHexString()};
// }

// export async function getMeetings() {
//   const client = await clientPromise;
//   const db = client.db();
//   const meetingsCollection = db.collection<Meeting>('meetings');
//   const meetings = await meetingsCollection.find({}).sort({time: -1}).toArray();
//   return meetings.map(meeting => ({
//     id: meeting._id.toHexString(),
//     name: meeting.name,
//     time: meeting.time,
//   }));
// }

// export async function getMeeting({meetingId}: {meetingId: string}) {
//   // Add a guard clause to prevent invalid ObjectId creation
//   if (!ObjectId.isValid(meetingId)) {
//     return null;
//   }

//   const client = await clientPromise;
//   const db = client.db();
//   const meetingsCollection = db.collection<Meeting>('meetings');

//   const meeting = await meetingsCollection.findOne({
//     _id: new ObjectId(meetingId),
//   });

//   if (!meeting) {
//     return null;
//   }

//   return {
//     id: meeting._id.toHexString(),
//     name: meeting.name,
//     time: meeting.time,
//     transcripts: meeting.transcripts || [],
//     summary: meeting.summary,
//   };
// }

// export async function addTranscriptToMeeting({
//   meetingId,
//   transcript,
// }: {
//   meetingId: string;
//   transcript: Transcript;
// }) {
//   const client = await clientPromise;
//   const db = client.db();
//   const meetingsCollection = db.collection<Meeting>('meetings');

//   // 1. Fetch the existing meeting
//   const currentMeeting = await getMeeting({meetingId});
//   if (!currentMeeting) {
//     throw new Error('Meeting not found');
//   }

//   // 2. Update the transcripts array in memory
//   const updatedTranscripts = [...currentMeeting.transcripts, transcript];

//   // 3. Generate the summary from the updated transcripts
//   const transcribedText = updatedTranscripts
//     .map(t => `${t.name}: ${t.transcript}`)
//     .join('\n');
//   const {summary} = await summarizeTranscribedText({transcribedText: transcribedText || ''});

//   // 4. Perform a single update with $set
//   const result = await meetingsCollection.updateOne(
//     {_id: new ObjectId(meetingId)},
//     {
//       $set: {
//         transcripts: updatedTranscripts,
//         summary: summary,
//         summaryCreatedAt: new Date(),
//       },
//     }
//   );

//   return {modifiedCount: result.modifiedCount};
// }


'use server';

import {summarizeTranscribedText} from '@/ai/flows/summarize-transcribed-text';
import clientPromise from '@/lib/mongodb';
import {ObjectId} from 'mongodb';

// Define interfaces for type safety
export interface Transcript {
  name: string;
  transcript: string;
  summary?: string;
  createdAt: Date;
}

export interface Meeting{
  name: string;
  time: string;
  createdAt: Date;
  transcripts: Transcript[];
  summary?: string;
  summaryCreatedAt?: Date;
}

export async function createMeeting(meetingData: {
  name: string;
  time: string;
}): Promise<{meetingId: string}> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const meeting = {
      ...meetingData,
      createdAt: new Date(),
      transcripts: [],
    };

    const result = await meetingsCollection.insertOne(meeting);
    
    if (!result.acknowledged) {
      throw new Error('Failed to create meeting');
    }

    return {meetingId: result.insertedId.toString()};
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw new Error('Failed to create meeting');
  }
}

export async function getMeetings(): Promise<Array<{id: string; name: string; time: string}>> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');
    
    const meetings = await meetingsCollection
      .find({})
      .sort({createdAt: -1})
      .toArray();

    return meetings.map(meeting => ({
      id: meeting._id.toString(),
      name: meeting.name,
      time: meeting.time,
    }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}

export async function getMeeting({meetingId}: {meetingId: string}): Promise<{
  id: string;
  name: string;
  time: string;
  transcripts: Transcript[];
  summary?: string;
  summaryCreatedAt?: Date;
} | null> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const meeting = await meetingsCollection.findOne({
      _id: new ObjectId(meetingId),
    });

    if (!meeting) {
      return null;
    }

    return {
      id: meeting._id.toString(),
      name: meeting.name,
      time: meeting.time,
      transcripts: meeting.transcripts || [],
      summary: meeting.summary,
      summaryCreatedAt: meeting.summaryCreatedAt,
    };
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }
}

export async function addTranscriptToMeeting({
  meetingId,
  transcript,
}: {
  meetingId: string;
  transcript: Omit<Transcript, 'createdAt'> & {createdAt?: Date};
}): Promise<{success: boolean; error?: string}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false, error: 'Invalid meeting ID'};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    // Prepare the transcript with createdAt
    const transcriptWithDate = {
      ...transcript,
      createdAt: transcript.createdAt || new Date(),
    };

    // First, push the new transcript
    const pushResult = await meetingsCollection.updateOne(
      {_id: new ObjectId(meetingId)},
      {
        $push: {
          transcripts: transcriptWithDate,
        },
      }
    );

    if (pushResult.matchedCount === 0) {
      return {success: false, error: 'Meeting not found'};
    }

    // Then, get all transcripts to generate summary
    const updatedMeeting = await meetingsCollection.findOne({
      _id: new ObjectId(meetingId),
    });

    if (!updatedMeeting) {
      return {success: false, error: 'Meeting not found after update'};
    }

    // Generate summary from all transcripts
    const transcribedText = updatedMeeting.transcripts
      .map(t => `${t.name}: ${t.transcript}`)
      .join('\n');

    let summary = '';
    try {
      const summaryResult = await summarizeTranscribedText({
        transcribedText: transcribedText || '',
      });
      summary = summaryResult.summary;
    } catch (summaryError) {
      console.error('Error generating summary:', summaryError);
      // Continue without summary rather than failing the entire operation
      summary = 'Summary generation failed';
    }

    // Update the summary
    await meetingsCollection.updateOne(
      {_id: new ObjectId(meetingId)},
      {
        $set: {
          summary: summary,
          summaryCreatedAt: new Date(),
        },
      }
    );

    return {success: true};
  } catch (error) {
    console.error('Error adding transcript to meeting:', error);
    return {success: false, error: 'Failed to add transcript to meeting'};
  }
}

// Additional utility functions you might need:

export async function deleteMeeting(meetingId: string): Promise<{success: boolean}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const result = await meetingsCollection.deleteOne({
      _id: new ObjectId(meetingId),
    });

    return {success: result.deletedCount === 1};
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return {success: false};
  }
}

export async function updateMeeting(
  meetingId: string,
  updates: Partial<Pick<Meeting, 'name' | 'time'>>
): Promise<{success: boolean}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const result = await meetingsCollection.updateOne(
      {_id: new ObjectId(meetingId)},
      {
        $set: updates,
      }
    );

    return {success: result.matchedCount === 1};
  } catch (error) {
    console.error('Error updating meeting:', error);
    return {success: false};
  }
}