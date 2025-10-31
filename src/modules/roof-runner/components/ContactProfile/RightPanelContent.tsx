import React from 'react';
import ActivityTab from './ActivityTab';
import TasksTab from './TasksTab';
import NotesTab from './NotesTab';
import AppointmentsTab from './AppointmentsTab';
import DocumentsTab from './DocumentsTab';
import PaymentsTab from './PaymentsTab';
import RelatedObjectsTab from './RelatedObjectsTab';

interface RightPanelContentProps {
  activeTab: string;
  contactId: number;
  documentsFilter: string;
  showPaymentActions: boolean;
  onAddTask: () => void;
  onAddNote: () => void;
  onAddAppointment: () => void;
  onAddDocument: () => void;
  onDocumentsFilterChange: (filter: string) => void;
  onPaymentActionsToggle: () => void;
}

const RightPanelContent: React.FC<RightPanelContentProps> = ({
  activeTab,
  contactId,
  documentsFilter,
  showPaymentActions,
  onAddTask,
  onAddNote,
  onAddAppointment,
  onAddDocument,
  onDocumentsFilterChange,
  onPaymentActionsToggle
}) => {
  switch (activeTab) {
    case 'activity':
      return <ActivityTab />;
    case 'tasks':
      return <TasksTab onAddTask={onAddTask} />;
    case 'notes':
      return <NotesTab contactId={contactId} onAddNote={onAddNote} />;
    case 'appointments':
      return <AppointmentsTab onAddAppointment={onAddAppointment} />;
    case 'documents':
      return <DocumentsTab filter={documentsFilter} onFilterChange={onDocumentsFilterChange} onAddDocument={onAddDocument} />;
    case 'payments':
      return <PaymentsTab showActions={showPaymentActions} onActionsToggle={onPaymentActionsToggle} />;
    case 'related':
      return <RelatedObjectsTab />;
    default:
      return <ActivityTab />;
  }
};

export default RightPanelContent;