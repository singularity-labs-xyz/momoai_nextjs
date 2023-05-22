import {
  IconBulbFilled,
  IconCheck,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  DragEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Document } from '@/types/document';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';

import DocumentbarContext from '../Documentbar.context';
import { DocumentModal } from './DocumentModal';

interface Props {
  document: Document;
}

export const DocumentComponent = ({ document }: Props) => {
  const {
    dispatch: documentDispatch,
    handleUpdateDocument,
    handleDeleteDocument,
  } = useContext(DocumentbarContext);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleUpdate = (document: Document) => {
    handleUpdateDocument(document);
    documentDispatch({ field: 'searchTerm', value: '' });
  };

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (isDeleting) {
      handleDeleteDocument(document);
      documentDispatch({ field: 'searchTerm', value: '' });
    }

    setIsDeleting(false);
  };

  const handleCancelDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, document: Document) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('document', JSON.stringify(document));
    }
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
        draggable="true"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        onDragStart={(e) => handleDragStart(e, document)}
        onMouseLeave={() => {
          setIsDeleting(false);
          setIsRenaming(false);
          setRenameValue('');
        }}
      >
        <IconBulbFilled size={18} />

        <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3">
          {document.name}
        </div>
      </button>

      {(isDeleting || isRenaming) && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleDelete}>
            <IconCheck size={18} />
          </SidebarActionButton>

          <SidebarActionButton handleClick={handleCancelDelete}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {!isDeleting && !isRenaming && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )}

      {showModal && (
        <DocumentModal
          document={document}
          onClose={() => setShowModal(false)}
          onUpdateDocument={handleUpdate}
        />
      )}
    </div>
  );
};
