import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TemplateBuilder } from "../components/proposals";
import { useAppSelector } from "../store/hooks";

interface TemplateBuilderPageProps {
  isProposal?: boolean;
  proposalId?: string;
}

export default function TemplateBuilderPage({
  isProposal = false,
  proposalId,
}: TemplateBuilderPageProps) {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;
  const { user } = useAppSelector((state : any) => state.auth);
  const orgSlug =
    user?.companySlug || localStorage.getItem("currentOrganizationSlug");

  const id = isProposal ? proposalId : templateId;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 dark:text-gray-400">
          {isProposal ? "Proposal" : "Template"} ID not found
        </div>
      </div>
    );
  }

  return (
    <TemplateBuilder
      templateId={isProposal ? undefined : id}
      proposalId={isProposal ? id : undefined}
      isProposal={isProposal}
      onClose={() => {
        if (from === "templates" || !event) {
          navigate(`/org/${orgSlug}/proposals`, { state: { activeTab: "Templates" } });
        } else {
          navigate(`/org/${orgSlug}/proposals`);
        }
      }}
    />
  );
}
