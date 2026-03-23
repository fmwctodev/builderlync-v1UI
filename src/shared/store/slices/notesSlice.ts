import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import { createNote, getNotes, deleteNote, updateNote, replyToNote, CreateNoteRequest } from '../services/contactsApi';

interface Note {
  id: number;
  data: string;
  contactId: number;
  createdAt: string;
  updatedAt: string;
  replies?: Note[];
}

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  isLoading: false,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    createNoteRequest: (state, action: PayloadAction<CreateNoteRequest>) => {
      state.isLoading = true;
      state.error = null;
    },
    createNoteSuccess: (state, action: PayloadAction<Note>) => {
      state.isLoading = false;
      state.notes.unshift(action.payload);
    },
    createNoteFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    getNotesRequest: (state, action: PayloadAction<{ contactId: number; page?: number; limit?: number }>) => {
      state.isLoading = true;
      state.error = null;
    },
    getNotesSuccess: (state, action: PayloadAction<Note[]>) => {
      state.isLoading = false;
      state.notes = action.payload;
    },
    getNotesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    deleteNoteRequest: (state, action: PayloadAction<number>) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteNoteSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.notes = state.notes.filter(note => note.id !== action.payload);
    },
    deleteNoteFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateNoteRequest: (state, action: PayloadAction<{ noteId: number; data: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    updateNoteSuccess: (state, action: PayloadAction<Note>) => {
      state.isLoading = false;
      const index = state.notes.findIndex(note => note.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },
    updateNoteFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    replyToNoteRequest: (state, action: PayloadAction<{ noteId: number; data: string; contactId: number }>) => {
      state.isLoading = true;
      state.error = null;
    },
    replyToNoteSuccess: (state, action: PayloadAction<{ noteId: number; reply: Note }>) => {
      state.isLoading = false;
      const note = state.notes.find(note => note.id === action.payload.noteId);
      if (note) {
        if (!note.replies) note.replies = [];
        note.replies.push(action.payload.reply);
      }
    },
    replyToNoteFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

function* createNoteSaga(action: PayloadAction<CreateNoteRequest>) {
  try {
    const response = yield call(createNote, action.payload);
    yield put(notesSlice.actions.createNoteSuccess(response.data));
  } catch (error: any) {
    yield put(notesSlice.actions.createNoteFailure(error.response?.data?.message || 'Failed to create note'));
  }
}

function* getNotesSaga(action: PayloadAction<{ contactId: number; page?: number; limit?: number }>) {
  try {
    const response = yield call(getNotes, action.payload.contactId, action.payload.page, action.payload.limit);
    yield put(notesSlice.actions.getNotesSuccess(response.data || []));
  } catch (error: any) {
    yield put(notesSlice.actions.getNotesFailure(error.response?.data?.message || 'Failed to fetch notes'));
  }
}

function* deleteNoteSaga(action: PayloadAction<number>) {
  try {
    yield call(deleteNote, action.payload);
    yield put(notesSlice.actions.deleteNoteSuccess(action.payload));
  } catch (error: any) {
    yield put(notesSlice.actions.deleteNoteFailure(error.response?.data?.message || 'Failed to delete note'));
  }
}

function* updateNoteSaga(action: PayloadAction<{ noteId: number; data: string }>) {
  try {
    const response = yield call(updateNote, action.payload.noteId, action.payload.data);
    yield put(notesSlice.actions.updateNoteSuccess(response.data));
  } catch (error: any) {
    yield put(notesSlice.actions.updateNoteFailure(error.response?.data?.message || 'Failed to update note'));
  }
}

function* replyToNoteSaga(action: PayloadAction<{ noteId: number; data: string; contactId: number }>) {
  try {
    const response = yield call(replyToNote, action.payload.noteId, action.payload.data, action.payload.contactId);
    yield put(notesSlice.actions.replyToNoteSuccess({ 
      noteId: action.payload.noteId, 
      reply: response.data 
    }));
  } catch (error: any) {
    yield put(notesSlice.actions.replyToNoteFailure(error.response?.data?.message || 'Failed to reply to note'));
  }
}

export function* notesSaga() {
  yield takeEvery(notesSlice.actions.createNoteRequest.type, createNoteSaga);
  yield takeEvery(notesSlice.actions.getNotesRequest.type, getNotesSaga);
  yield takeEvery(notesSlice.actions.deleteNoteRequest.type, deleteNoteSaga);
  yield takeEvery(notesSlice.actions.updateNoteRequest.type, updateNoteSaga);
  yield takeEvery(notesSlice.actions.replyToNoteRequest.type, replyToNoteSaga);
}

export const {
  createNoteRequest,
  getNotesRequest,
  deleteNoteRequest,
  updateNoteRequest,
  replyToNoteRequest,
  clearError,
} = notesSlice.actions;

export default notesSlice.reducer;