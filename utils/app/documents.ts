import { Document } from '@/types/document';

export const updateDocument = (updatedDocument: Document, allDocuments: Document[]) => {
  const updatedDocuments = allDocuments.map((c) => {
    if (c.id === updatedDocument.id) {
      return updatedDocument;
    }

    return c;
  });

  saveDocuments(updatedDocuments);

  return {
    single: updatedDocument,
    all: updatedDocuments,
  };
};

export const saveDocuments = (documents: Document[]) => {
  localStorage.setItem('documents', JSON.stringify(documents));
};
