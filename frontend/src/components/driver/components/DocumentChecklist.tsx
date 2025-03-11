import React from 'react';

interface DocumentChecklistProps {
  onDocumentClick: (documentId: string) => void;
  onNextClick: () => void;
  completedDocuments: string[];
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  onDocumentClick,
  onNextClick,
  completedDocuments
}) => {
  const documents = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'documents', title: 'Personal Documents' },
    { id: 'vehicle', title: 'Vehicle Details' },
    { id: 'bank', title: 'Bank Account Details' },
  ];

  const allCompleted = documents.every(doc => completedDocuments.includes(doc.id));

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="space-y-3">
        {documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => onDocumentClick(doc.id)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <span className="text-gray-800">{doc.title}</span>
            <div className="flex items-center">
              <span className={`text-sm ${
                completedDocuments.includes(doc.id) ? 'text-green-500' : 'text-red-500'
              }`}>
                {completedDocuments.includes(doc.id) ? '✓' : '→'}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNextClick}
        disabled={!allCompleted}
        className={`w-full mt-6 bg-indigo-900 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center
          ${!allCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-800'}`}
      >
        NEXT
        <span className="ml-2">→</span>
      </button>
    </div>
  );
};