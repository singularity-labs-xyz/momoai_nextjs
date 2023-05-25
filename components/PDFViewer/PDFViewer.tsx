import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf'

interface Props {
  url: string;
}

const PDFViewer = ({ url }: Props) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  return (
    <div className="max-h-screen overflow-y-auto">
      <Document
        file={'https://corsproxy.io/?' + encodeURIComponent(url)}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
    </div>
  );
};

export default PDFViewer;
