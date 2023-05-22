import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Document } from '@/types/document';

import { DocumentbarInitialState } from './Documentbar.state';

export interface DocumentbarContextProps {
  state: DocumentbarInitialState;
  dispatch: Dispatch<ActionType<DocumentbarInitialState>>;
  handleCreateDocument: () => void;
  handleDeleteDocument: (document: Document) => void;
  handleUpdateDocument: (document: Document) => void;
}

const DocumentbarContext = createContext<DocumentbarContextProps>(undefined!);

export default DocumentbarContext;
