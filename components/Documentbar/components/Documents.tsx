import { FC } from 'react';

import { Document } from '@/types/document';

import { DocumentComponent } from './Document';

interface Props {
  documents: Document[];
}

export const Documents: FC<Props> = ({ documents }) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {documents
        .slice()
        .reverse()
        .map((document, index) => (
          <DocumentComponent key={index} document={document} />
        ))}
    </div>
  );
};
