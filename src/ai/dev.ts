import {transcribeAudioElevenLabsFlow} from './flows/transcribe-audio-eleven-labs';
import {summarizeTranscribedTextFlow} from './flows/summarize-transcribed-text';

// To start the flow, run `genkit start`
// You can view the flow in the Genkit developer UI
// To call the flow from your app, use the Genkit SDK
// See https://firebase.google.com/docs/genkit/get-started

export default {
  flows: [transcribeAudioElevenLabsFlow, summarizeTranscribedTextFlow],
};
