import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateContactRequest, ContactResponse } from '../services/contactsApi';

interface ContactsState {
  isLoading: boolean;
  error: string | null;
  contacts: any[];
  currentContact: any | null;
  isLoadingContact: boolean;
}

const initialState: ContactsState = {
  isLoading: false,
  error: null,
  contacts: [],
  currentContact: null,
  isLoadingContact: false
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    createContactRequest: (state, action: PayloadAction<CreateContactRequest>) => {
      console.log('createContactRequest reducer called with:', action.payload);
      state.isLoading = true;
      state.error = null;
    },
    createContactSuccess: (state, action: PayloadAction<ContactResponse>) => {
      state.isLoading = false;
      state.contacts.push(action.payload.data);
    },
    createContactFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    getContactByIdRequest: (state, action: PayloadAction<number>) => {
      state.isLoadingContact = true;
      state.error = null;
    },
    getContactByIdSuccess: (state, action: PayloadAction<ContactResponse>) => {
      state.isLoadingContact = false;
      state.currentContact = action.payload.data;
    },
    getContactByIdFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingContact = false;
      state.error = action.payload;
    }
  }
});

export const { createContactRequest, createContactSuccess, createContactFailure, getContactByIdRequest, getContactByIdSuccess, getContactByIdFailure } = contactsSlice.actions;
export const contactsReducer = contactsSlice.reducer;
export default contactsSlice.reducer;