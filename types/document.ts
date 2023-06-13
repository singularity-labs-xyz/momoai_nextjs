import { OpenAIModel } from './openai';
import { Conversation } from './chat';

export interface Document {
  id: string;
  name: string;
  description: string;
  content: string;
  folderId: string | null;
}
