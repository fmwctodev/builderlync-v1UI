import type { NavigateFunction } from 'react-router-dom';

export function getProposalBuilderPath(proposalId: string): string {
  return `/proposals/${proposalId}/edit`;
}

export function getProposalPreviewPath(proposalId: string): string {
  return `/proposals/${proposalId}/preview`;
}

export function getProposalsListPath(): string {
  return '/proposals';
}

export function navigateToProposalBuilder(
  navigate: NavigateFunction,
  proposalId: string
): void {
  navigate(getProposalBuilderPath(proposalId));
}

export function navigateToProposalPreview(
  navigate: NavigateFunction,
  proposalId: string
): void {
  navigate(getProposalPreviewPath(proposalId));
}

export function navigateToProposalsList(navigate: NavigateFunction): void {
  navigate(getProposalsListPath());
}

export function getProposalEditUrl(proposalId: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}${getProposalBuilderPath(proposalId)}`;
}

export function getProposalShareUrl(proposalId: string, shareToken: string): string {
  return `${window.location.origin}/proposal/view/${proposalId}?token=${shareToken}`;
}
