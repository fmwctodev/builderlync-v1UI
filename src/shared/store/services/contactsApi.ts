import { supabase } from '../../lib/supabase';

export interface CreateContactRequest {
  fullName: string;
  type: string;
  labelOrRole: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Contact {
  id: string;
  full_name: string;
  type: string;
  label_or_role: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data: Contact;
}

export interface ContactsListResponse {
  success: boolean;
  data: {
    data: Contact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

function camelToSnake(obj: any): any {
  const snakeObj: any = {};
  const keyMap: Record<string, string> = {
    fullName: 'full_name',
    labelOrRole: 'label_or_role',
  };

  for (const key in obj) {
    const snakeKey = keyMap[key] || key;
    snakeObj[snakeKey] = obj[key];
  }

  return snakeObj;
}

export const createContact = async (contactData: CreateContactRequest): Promise<ContactResponse> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const snakeData = camelToSnake(contactData);
  snakeData.user_id = user.id;

  const nameParts = contactData.fullName.trim().split(' ');
  if (nameParts.length >= 2) {
    snakeData.first_name = nameParts[0];
    snakeData.last_name = nameParts.slice(1).join(' ');
  } else {
    snakeData.first_name = contactData.fullName;
    snakeData.last_name = '';
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert([snakeData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: 'Contact created successfully',
    data
  };
};

export const getContacts = async (search?: string, type?: string, page: number = 1, limit: number = 10): Promise<ContactsListResponse> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%`);
  }

  if (type) {
    query = query.eq('type', type);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data: {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  };
};

export const searchContactsByTypeAndName = async (search: string, types: string[]): Promise<Contact[]> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  if (!search || search.length < 2) {
    return [];
  }

  let query = supabase
    .from('contacts')
    .select('*');

  if (types && types.length > 0) {
    query = query.in('type', types);
  }

  query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);

  query = query
    .order('full_name', { ascending: true })
    .limit(10);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getContactById = async (id: string): Promise<ContactResponse> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    data
  };
};

export const updateContact = async (id: string, contactData: CreateContactRequest): Promise<ContactResponse> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const snakeData = camelToSnake(contactData);

  const nameParts = contactData.fullName.trim().split(' ');
  if (nameParts.length >= 2) {
    snakeData.first_name = nameParts[0];
    snakeData.last_name = nameParts.slice(1).join(' ');
  } else {
    snakeData.first_name = contactData.fullName;
    snakeData.last_name = '';
  }

  const { data, error } = await supabase
    .from('contacts')
    .update(snakeData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: 'Contact updated successfully',
    data
  };
};

export const deleteContact = async (id: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: 'Contact deleted successfully'
  };
};

export const uploadContactsCsv = async (file: File) => {
  throw new Error('CSV upload not yet implemented in Supabase version');
};

export interface CreateNoteRequest {
  data: string;
  contactId: number;
}

export const createNote = async (noteData: CreateNoteRequest) => {
  throw new Error('Notes not yet migrated to Supabase');
};

export const getNotes = async (contactId: number, page: number = 1, limit: number = 10) => {
  throw new Error('Notes not yet migrated to Supabase');
};

export const deleteNote = async (noteId: number) => {
  throw new Error('Notes not yet migrated to Supabase');
};

export const updateNote = async (noteId: number, data: string) => {
  throw new Error('Notes not yet migrated to Supabase');
};

export const replyToNote = async (noteId: number, data: string, contactId: number) => {
  throw new Error('Notes not yet migrated to Supabase');
};
