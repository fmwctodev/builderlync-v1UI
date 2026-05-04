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
  showPaymentActions: boolean;
  onPaymentActionsToggle: () => void;
}

const RightPanelContent: React.FC<RightPanelContentProps> = ({
  activeTab,
  contactId,
  showPaymentActions,
  onPaymentActionsToggle
}) => {
  switch (activeTab) {
    case 'activity':
      return <ActivityTab contactId={contactId} />;
    case 'tasks':
      return <TasksTab contactId={contactId} />;
    case 'notes':
      return <NotesTab contactId={contactId} />;
    case 'appointments':
      return <AppointmentsTab contactId={contactId} />;
    case 'documents':
      return <DocumentsTab contactId={contactId} />;
    case 'payments':
      return <PaymentsTab contactId={contactId} showActions={showPaymentActions} onActionsToggle={onPaymentActionsToggle} />;
    case 'related':
      return <RelatedObjectsTab />;
    default:
      return <ActivityTab contactId={contactId} />;
  }
};

export default RightPanelContent;