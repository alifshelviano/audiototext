import { config } from 'dotenv';
config();

import '@/ai/flows/transcribe-audio-eleven-labs.ts';
import '@/ai/flows/summarize-transcribed-text.ts';