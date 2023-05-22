import { Document } from '@/types/document';

export interface DocumentbarInitialState {
  searchTerm: string;
  filteredDocuments: Document[];
}

export const initialState: DocumentbarInitialState = {
  searchTerm: '',
  filteredDocuments: [],
};
