import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { saveDocuments } from '@/utils/app/documents';

import { OpenAIModels } from '@/types/openai';
import { Document } from '@/types/document';

import HomeContext from '@/pages/home/home.context';

import { DocumentFolders } from './components/DocumentFolders';
import { DocumentbarSettings } from './components/DocumentSettings';
import { Documents } from './components/Documents';

import Sidebar from '../Sidebar';
import DocumentbarContext from './Documentbar.context';
import { DocumentbarInitialState, initialState } from './Documentbar.state';

import { v4 as uuidv4 } from 'uuid';

const Documentbar = () => {
  const { t } = useTranslation('documentbar');

  const documentBarContextValue = useCreateReducer<DocumentbarInitialState>({
    initialState,
  });

  const {
    state: { documents, defaultModelId, showDocumentbar },
    dispatch: homeDispatch,
    handleCreateFolder,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredDocuments },
    dispatch: documentDispatch,
  } = documentBarContextValue;

  const handleToggleDocumentbar = () => {
    homeDispatch({ field: 'showDocumentbar', value: !showDocumentbar });
    localStorage.setItem('showDocumentbar', JSON.stringify(!showDocumentbar));
  };

  const handleCreateDocument = () => {
    if (defaultModelId) {
      const newDocument: Document = {
        id: uuidv4(),
        name: `Document ${documents.length + 1}`,
        description: '',
        content: '',
        model: OpenAIModels[defaultModelId],
        folderId: null,
      };

      const updatedDocuments = [...documents, newDocument];

      homeDispatch({ field: 'documents', value: updatedDocuments });

      saveDocuments(updatedDocuments);
    }
  };

  const handleDeleteDocument = (document: Document) => {
    const updatedDocuments = documents.filter((p) => p.id !== document.id);

    homeDispatch({ field: 'documents', value: updatedDocuments });
    saveDocuments(updatedDocuments);
  };

  const handleUpdateDocument = (document: Document) => {
    const updatedDocuments = documents.map((p) => {
      if (p.id === document.id) {
        return document;
      }

      return p;
    });
    homeDispatch({ field: 'documents', value: updatedDocuments });

    saveDocuments(updatedDocuments);
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const document = JSON.parse(e.dataTransfer.getData('document'));

      const updatedDocument = {
        ...document,
        folderId: e.target.dataset.folderId,
      };

      handleUpdateDocument(updatedDocument);

      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      documentDispatch({
        field: 'filteredDocuments',
        value: documents.filter((document) => {
          const searchable =
            document.name.toLowerCase() +
            ' ' +
            document.description.toLowerCase() +
            ' ' +
            document.content.toLowerCase();
          return searchable.includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      documentDispatch({ field: 'filteredDocuments', value: documents });
    }
  }, [searchTerm, documents]);

  return (
    <DocumentbarContext.Provider
      value={{
        ...documentBarContextValue,
        handleCreateDocument,
        handleDeleteDocument,
        handleUpdateDocument,
      }}
    >
      <Sidebar<Document>
        side={'left'}
        isOpen={showDocumentbar}
        addItemButtonTitle={t('New document')}
        itemComponent={
          <Documents
            documents={filteredDocuments.filter((document) => !document.folderId)}
          />
        }
        folderComponent={<DocumentFolders />}
        items={filteredDocuments}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          documentDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleDocumentbar}
        handleCreateItem={handleCreateDocument}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'document')}
        handleDrop={handleDrop}
      />
    </DocumentbarContext.Provider>
  );
};

export default Documentbar;
