import { useContext } from 'react';

import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/home/home.context';

import Folder from '@/components/Folder';
import { DocumentComponent } from '@/components/Documentbar/components/Document';

import DocumentbarContext from '../Documentbar.context';

export const DocumentFolders = () => {
  const {
    state: { folders },
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredDocuments },
    handleUpdateDocument,
  } = useContext(DocumentbarContext);

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const document = JSON.parse(e.dataTransfer.getData('document'));

      const updatedDocument = {
        ...document,
        folderId: folder.id,
      };

      handleUpdateDocument(updatedDocument);
    }
  };

  const DocumentFolders = (currentFolder: FolderInterface) =>
    filteredDocuments
      .filter((p) => p.folderId)
      .map((document, index) => {
        if (document.folderId === currentFolder.id) {
          return (
            <div key={index} className="ml-5 gap-2 border-l pl-2">
              <DocumentComponent document={document} />
            </div>
          );
        }
      });

  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter((folder) => folder.type === 'document')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={DocumentFolders(folder)}
          />
        ))}
    </div>
  );
};
