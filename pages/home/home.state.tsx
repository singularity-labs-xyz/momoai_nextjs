import { Conversation, Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';
import { OpenAIModel, OpenAIModelID, OpenAIModels} from '@/types/openai';
import { PluginKey } from '@/types/plugin';
import { Prompt } from '@/types/prompt';
import { Document } from '@/types/document';
import { v4 as uuidv4 } from 'uuid';

export interface HomeInitialState {
  loading: boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  models: OpenAIModel[];
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  documents: Document[];
  selectedDocument: Document | undefined;
  temperature: number;
  showChatbar: boolean;
  showDocumentbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: OpenAIModelID | undefined;
}

export const initialState: HomeInitialState = {
  loading: false,
  lightMode: 'dark',
  messageIsStreaming: false,
  modelError: null,
  models: [OpenAIModels[OpenAIModelID.GPT_3_5]],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  documents: [],
  selectedDocument: undefined,
  temperature: 1,
  showChatbar: true,
  showDocumentbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: undefined,
};
