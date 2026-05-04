export type SectionType =
  | 'intro'
  | 'scope'
  | 'materials'
  | 'timeline'
  | 'terms'
  | 'damage_assessment'
  | 'custom';

export interface AiGeneratedSection {
  id?: string;
  section_type: SectionType;
  title: string;
  content: string;
  sort_order: number;
}

export interface GenerateAiProposalRequest {
  organization_id: string;
  proposal_id: string;
  contact_id?: string;
  job_id?: string;
  snapshot_id?: string;
  sections_to_generate: SectionType[];
  custom_instructions?: string;
}

export interface GenerateAiProposalResponse {
  success: boolean;
  sections_generated: number;
  sections: AiGeneratedSection[];
  error?: { message: string };
  catalog_suggestions?: any[];
  explanation?: string;
  sections_refined?: number;
  commands_executed?: number;
}

export interface AiProposalTemplate {
  id: string;
  name: string;
  description: string;
  section_types: SectionType[];
  default_instructions: string;
}

export const AI_PROPOSAL_TEMPLATES: AiProposalTemplate[] = [
  {
    id: 'residential',
    name: 'Residential Roofing',
    description: 'Standard residential shingle replacement or repair proposal',
    section_types: ['intro', 'scope', 'materials', 'timeline', 'terms'],
    default_instructions: 'This is a residential roofing project. Use friendly, clear language appropriate for homeowners.',
  },
  {
    id: 'commercial',
    name: 'Commercial Roofing',
    description: 'Commercial flat or low-slope roofing systems',
    section_types: ['intro', 'scope', 'materials', 'timeline', 'terms'],
    default_instructions: 'This is a commercial roofing project. Use professional, technical language appropriate for business decision-makers.',
  },
  {
    id: 'insurance',
    name: 'Insurance Claim',
    description: 'Insurance restoration with damage assessment and scope of loss',
    section_types: ['intro', 'damage_assessment', 'scope', 'materials', 'timeline', 'terms'],
    default_instructions: 'This is an insurance restoration project. Include detailed damage assessment language, reference to storm/hail damage, and align scope with insurance adjuster terminology.',
  },
];

export const SECTION_LABELS: Record<SectionType, string> = {
  intro: 'Introduction / Executive Summary',
  scope: 'Scope of Work',
  materials: 'Materials & Products',
  timeline: 'Project Timeline',
  terms: 'Terms & Conditions',
  damage_assessment: 'Damage Assessment',
  custom: 'Additional Notes',
};
