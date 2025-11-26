import { supabase } from '../../lib/supabase';

export interface Job {
  id: number;
  name: string;
  location: string;
  assignees: string[];
  jobOwner: string;
  workflowStages: string;
  closeDate: string;
  jobValue: number;
  source: string;
  details: string;
  createdBy: string;
  insuranceEnabled: boolean;
  insuranceCompany: string;
  policyAccountNumber: string;
  claimNumber: string;
  dateOfLoss: string;
  typeOfDamage: string;
  claimAmount: number;
  deductible: number;
  claimDetails: string;
  measurementsId: number | null;
  proposalsId: number | null;
  pdfSignerId: number | null;
  materialOrdersId: number | null;
  workOrdersId: number | null;
  invoiceId: number | null;
  jobCostingsId: number | null;
  attachmentsId: number | null;
  instantEstimateId: number | null;
  integrationsId: number | null;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  editedByName: string | null;
  editedBy: string | null;
  jobType?: 'residential' | 'commercial' | 'insurance';
  contactId?: number | null;
  contactName?: string | null;
}

export interface JobsResponse {
  success: boolean;
  data: {
    data: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateJobRequest {
  name: string;
  location: string;
  assignees: string[];
  jobOwner: string;
  workflowStages: string;
  closeDate?: string;
  jobValue: number;
  source: string;
  details: string;
  insuranceEnabled: boolean;
  insuranceCompany: string;
  policyAccountNumber: string;
  claimNumber: string;
  dateOfLoss?: string;
  typeOfDamage: string;
  claimAmount: number;
  deductible: number;
  claimDetails: string;
  createdBy: string;
  createdByName: string;
  editedBy: string;
  editedByName: string;
  jobType?: 'residential' | 'commercial' | 'insurance';
  contactId?: number | null;
  contactName?: string | null;
}

function camelToSnake(obj: any): any {
  const snakeObj: any = {};

  const keyMap: Record<string, string> = {
    jobOwner: 'job_owner',
    workflowStages: 'workflow_stages',
    closeDate: 'close_date',
    jobValue: 'job_value',
    insuranceEnabled: 'insurance_enabled',
    insuranceCompany: 'insurance_company',
    policyAccountNumber: 'policy_account_number',
    claimNumber: 'claim_number',
    dateOfLoss: 'date_of_loss',
    typeOfDamage: 'type_of_damage',
    claimAmount: 'claim_amount',
    claimDetails: 'claim_details',
    measurementsId: 'measurements_id',
    proposalsId: 'proposals_id',
    pdfSignerId: 'pdf_signer_id',
    materialOrdersId: 'material_orders_id',
    workOrdersId: 'work_orders_id',
    invoiceId: 'invoice_id',
    jobCostingsId: 'job_costings_id',
    attachmentsId: 'attachments_id',
    instantEstimateId: 'instant_estimate_id',
    integrationsId: 'integrations_id',
    createdBy: 'created_by',
    createdByName: 'created_by_name',
    editedBy: 'edited_by',
    editedByName: 'edited_by_name',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    jobType: 'job_type',
    contactId: 'contact_id',
    contactName: 'contact_name'
  };

  for (const key in obj) {
    const snakeKey = keyMap[key] || key;
    snakeObj[snakeKey] = obj[key];
  }

  return snakeObj;
}

function snakeToCamel(obj: any): any {
  const camelObj: any = {};

  const keyMap: Record<string, string> = {
    job_owner: 'jobOwner',
    workflow_stages: 'workflowStages',
    close_date: 'closeDate',
    job_value: 'jobValue',
    insurance_enabled: 'insuranceEnabled',
    insurance_company: 'insuranceCompany',
    policy_account_number: 'policyAccountNumber',
    claim_number: 'claimNumber',
    date_of_loss: 'dateOfLoss',
    type_of_damage: 'typeOfDamage',
    claim_amount: 'claimAmount',
    claim_details: 'claimDetails',
    measurements_id: 'measurementsId',
    proposals_id: 'proposalsId',
    pdf_signer_id: 'pdfSignerId',
    material_orders_id: 'materialOrdersId',
    work_orders_id: 'workOrdersId',
    invoice_id: 'invoiceId',
    job_costings_id: 'jobCostingsId',
    attachments_id: 'attachmentsId',
    instant_estimate_id: 'instantEstimateId',
    integrations_id: 'integrationsId',
    created_by: 'createdBy',
    created_by_name: 'createdByName',
    edited_by: 'editedBy',
    edited_by_name: 'editedByName',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    job_type: 'jobType',
    contact_id: 'contactId',
    contact_name: 'contactName'
  };

  for (const key in obj) {
    const camelKey = keyMap[key] || key;
    camelObj[camelKey] = obj[key];
  }

  return camelObj;
}

export const getJobs = async (page: number = 1, limit: number = 10): Promise<JobsResponse> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const offset = (page - 1) * limit;

  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  const jobs = (data || []).map(snakeToCamel) as Job[];

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data: {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  };
};

export const createJob = async (jobData: CreateJobRequest) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const snakeData = camelToSnake(jobData);
  snakeData.created_by = user.id;
  snakeData.edited_by = user.id;

  if (!snakeData.close_date) delete snakeData.close_date;
  if (!snakeData.date_of_loss) delete snakeData.date_of_loss;

  const { data, error } = await supabase
    .from('jobs')
    .insert([snakeData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    data: snakeToCamel(data)
  };
};

export const updateJob = async (id: number, jobData: CreateJobRequest) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const snakeData = camelToSnake(jobData);
  snakeData.edited_by = user.id;

  if (!snakeData.close_date) delete snakeData.close_date;
  if (!snakeData.date_of_loss) delete snakeData.date_of_loss;

  delete snakeData.created_by;
  delete snakeData.created_at;

  const { data, error } = await supabase
    .from('jobs')
    .update(snakeData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    data: snakeToCamel(data)
  };
};

export const deleteJob = async (id: number) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: 'Job deleted successfully'
  };
};

export const getJobById = async (id: number) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    data: snakeToCamel(data)
  };
};
