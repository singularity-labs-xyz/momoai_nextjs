import { useContext } from 'react';

import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/home/home.context';

import Folder from '@/components/Folder';

import { ConversationComponent } from './Conversation';

interface Props {
  searchTerm: string;
}

export const ChatFolders = ({ searchTerm }: Props) => {
  const {
    state: { folders, conversations },
    handleUpdateConversation,
  } = useContext(HomeContext);

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, {
        key: 'folderId',
        value: folder.id,
      });
    }
  };

  // const ChatFolders = (currentFolder: FolderInterface) => {
  //   return (
  //     conversations &&
  //     conversations
  //       .filter((conversation) => conversation.folderId)
  //       .map((conversation, index) => {
  //         if (conversation.folderId === currentFolder.id) {
  //           return (
  //             <div key={index} className="ml-5 gap-2 border-l pl-2">
  //               <ConversationComponent conversation={conversation} />
  //             </div>
  //           );
  //         }
  //       })
  //   );
  // };

  const ChatFolders = (currentFolder: FolderInterface) => {
    const conversationComponents = conversations?.filter((conversation) => conversation.folderId).map((conversation, index) => {
      if (conversation.folderId === currentFolder.id) {
        return (
          <div key={index} className="ml-5 gap-2 border-l pl-2">
            <ConversationComponent conversation={conversation} />
          </div>
        );
      }
    });
  
    const folderComponents = folders?.filter((folder) => folder.parentFolderId === currentFolder.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder, index) => (
        <Folder
          key={index}
          searchTerm={searchTerm}
          currentFolder={folder}
          handleDrop={handleDrop}
          folderComponent={ChatFolders(folder)}
        />
      ));
  
    return [...conversationComponents, ...folderComponents];
  };
  
  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter((folder) => folder.type === 'chat' && !folder.parentFolderId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={ChatFolders(folder)}
          />
        ))}
    </div>
  );
};
