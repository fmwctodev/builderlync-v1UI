import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateContactRequest, ContactResponse } from '../services/contactsApi';

interface ContactsState {
  isLoading: boolean;
  error: string | null;
  contacts: any[];
}

const initialState: ContactsState = {
  isLoading: false,
  error: null,
  contacts: []
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
    }
  }
});

export const { createContactRequest, createContactSuccess, createContactFailure } = contactsSlice.actions;
export const contactsReducer = contactsSlice.reducer;
export default contactsSlice.reducer;