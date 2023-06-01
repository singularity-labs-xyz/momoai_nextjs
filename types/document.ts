import { OpenAIModel } from './openai';

export interface Document {
  id: string;
  name: string;
  description: string;
  content: string;
  folderId: string | null;
}
