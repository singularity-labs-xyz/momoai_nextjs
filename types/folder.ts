export interface FolderInterface {
  id: string;
  name: string;
  type: FolderType;
  parentFolderId: string | null; // null if root folder
}

export type FolderType = 'chat' | 'prompt' | 'document';
