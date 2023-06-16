import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';
import { saveDocuments } from '@/utils/app/documents';
import { getSettings } from '@/utils/app/settings';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { Document } from '@/types/document';

import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import Promptbar from '@/components/Promptbar';
import Documentbar from '@/components/Documentbar';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import { v4 as uuidv4 } from 'uuid';
import DocumentViewer from '@/components/DocumentViewer';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      apiKey,
      lightMode,
      folders,
      conversations,
      selectedConversation,
      selectedDocument,
      prompts,
      documents,
      temperature,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const { data, error, refetch } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
  );

  useEffect(() => {
    if (data) dispatch({ field: 'models', value: data });
  }, [data, dispatch]);

  useEffect(() => {
    dispatch({ field: 'modelError', value: getModelsError(error) });
  }, [dispatch, error, getModelsError]);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType, parentFolderId: string | null = null) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
      parentFolderId,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  // const handleDeleteFolder = (folderId: string) => {
  //   const updatedFolders = folders.filter((f) => f.id !== folderId);
  //   dispatch({ field: 'folders', value: updatedFolders });
  //   saveFolders(updatedFolders);

  //   const updatedConversations: Conversation[] = conversations.map((c) => {
  //     if (c.folderId === folderId) {
  //       return {
  //         ...c,
  //         folderId: null,
  //       };
  //     }

  //     return c;
  //   });

  //   dispatch({ field: 'conversations', value: updatedConversations });
  //   saveConversations(updatedConversations);

  //   const updatedPrompts: Prompt[] = prompts.map((p) => {
  //     if (p.folderId === folderId) {
  //       return {
  //         ...p,
  //         folderId: null,
  //       };
  //     }

  //     return p;
  //   });

  //   dispatch({ field: 'prompts', value: updatedPrompts });
  //   savePrompts(updatedPrompts);
  // };

  const handleDeleteFolder = (folderId: string) => {
    // Get all subfolders recursively
    const getAllSubfolders = (id: string): string[] => {
      let subfolders = folders.filter(f => f.parentFolderId === id).map(f => f.id);
      for (let subfolderId of subfolders) {
        subfolders = [...subfolders, ...getAllSubfolders(subfolderId)];
      }
      return subfolders;
    };

    const foldersToDelete = [folderId, ...getAllSubfolders(folderId)];

    const updatedFolders = folders.filter(f => !foldersToDelete.includes(f.id));
    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    // Delete conversations, prompts and documents of the deleted folders
    const updateItems = (items: any[], saveItems: (items: any[]) => void) => {
      const updatedItems = items.map(item => {
        if (foldersToDelete.includes(item.folderId)) {
          return { ...item, folderId: null };
        }
        return item;
      });
      if (items.length > 0) {
        dispatch({ field: items[0].type, value: updatedItems });
      }
      saveItems(updatedItems);
    }

    updateItems(conversations, saveConversations);
    updateItems(prompts, savePrompts);
    updateItems(documents, saveDocuments);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  // const handleDocumentUpload = (): Promise<string> => {
  //   return new Promise<string>((resolve, reject) => {
  //     const input = document.createElement('input');
  //     input.type = 'file';
  //     input.accept = 'application/pdf'; // Adjust according to your needs
  
  //     input.onchange = async (event) => {
  //       const file = (event.target as HTMLInputElement).files![0];
  
  //       // Implement your own logic to upload the file to your backend
  //       const formData = new FormData();
  //       formData.append('file', file);
  
  //       try {
  //         // const response = await fetch('/your-backend-endpoint', { // Update this to your actual backend endpoint
  //         //   method: 'POST',
  //         //   body: formData,
  //         // });
  
  //         // const data = await response.json();
  //         const data = { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' };
  //         resolve(data.url); // The URL of the uploaded file
  //       } catch (error) {
  //         reject(error);
  //       }
  //     };
  
  //     input.click();
  //   });
  // };

  // TODO: figure out if document should be passed in here or not
  const handleNewConversation = async (name: string | null, documentId: string | null) => {
    const lastConversation = conversations[conversations.length - 1];

    const conversationId = uuidv4()

    const newConversation: Conversation = {
      id: conversationId,
      name: name || t('New Conversation'),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
      documentId: documentId || null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);
    console.log("saved conversation", newConversation)

    dispatch({ field: 'loading', value: false });

    return newConversation;
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  // DOCUMENT OPERATIONS  --------------------------------------------

  const handleSelectDocument = (document: Document) => {
    // TODO: finalize logic for creating new conversations from documents
    // TODO: Figure out loading while embeddings are being generated
    dispatch({
      field: 'selectedDocument',
      value: document,
    });
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch({ field: 'pluginKeys', value: pluginKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
      dispatch({ field: 'showPromptbar', value: false });
      dispatch({ field: 'showDocumentbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }

    const showDocumentbar = localStorage.getItem('showDocumentbar');
    if (showDocumentbar) {
      dispatch({ field: 'showDocumentbar', value: showDocumentbar === 'true' });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({ field: 'folders', value: JSON.parse(folders) });
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }

    // fetch from mongo
    const documents = localStorage.getItem('documents');
    if (documents) {
      dispatch({ field: 'documents', value: JSON.parse(documents) });
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      dispatch({ field: 'conversations', value: cleanedConversationHistory });
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {
      const lastConversation = conversations[conversations.length - 1];
      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
        handleSelectDocument,
      }}
    >
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={() => {handleNewConversation(null, null)}}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Documentbar/>
            {/* <Chatbar />

            {selectedConversation.documentUrl && (
              <iframe src={selectedConversation.documentUrl} width="40%" height="100%" />
            )} */}

            <div className="flex flex-1 flex-row">
              <DocumentViewer/>
              <Chat stopConversationRef={stopConversationRef} />
            </div>
            <Chatbar />
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
