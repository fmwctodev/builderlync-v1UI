import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import { createTask, getTasks, getTaskById, updateTask, deleteTask, CreateTaskRequest, TaskResponse } from '../services/tasksApi';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  isRecurring: boolean;
  assignedTo: string;
  contactId: number;
  createdAt: string;
  updatedAt: string;
}

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  isLoadingTask: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  isLoadingTask: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Create Task
    createTaskRequest: (state, action: PayloadAction<CreateTaskRequest>) => {
      state.isLoading = true;
      state.error = null;
    },
    createTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.isLoading = false;
      state.tasks.unshift(action.payload);
    },
    createTaskFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get Tasks
    getTasksRequest: (state, action: PayloadAction<{ contactId?: number; page?: number; limit?: number }>) => {
      state.isLoading = true;
      state.error = null;
    },
    getTasksSuccess: (state, action: PayloadAction<{ tasks: Task[]; totalPages: number; currentPage: number }>) => {
      state.isLoading = false;
      state.tasks = action.payload.tasks;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
    },
    getTasksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get Task by ID
    getTaskByIdRequest: (state, action: PayloadAction<number>) => {
      state.isLoadingTask = true;
      state.error = null;
    },
    getTaskByIdSuccess: (state, action: PayloadAction<Task>) => {
      state.isLoadingTask = false;
      state.currentTask = action.payload;
    },
    getTaskByIdFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingTask = false;
      state.error = action.payload;
    },

    // Update Task
    updateTaskRequest: (state, action: PayloadAction<{ id: number; taskData: CreateTaskRequest }>) => {
      state.isLoading = true;
      state.error = null;
    },
    updateTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.isLoading = false;
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask?.id === action.payload.id) {
        state.currentTask = action.payload;
      }
    },
    updateTaskFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete Task
    deleteTaskRequest: (state, action: PayloadAction<number>) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteTaskSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.currentTask?.id === action.payload) {
        state.currentTask = null;
      }
    },
    deleteTaskFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

// Sagas
function* createTaskSaga(action: PayloadAction<CreateTaskRequest>) {
  try {
    const response: TaskResponse = yield call(createTask, action.payload);
    const task: Task = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      dueDate: response.data.due_date,
      dueTime: response.data.due_time,
      isRecurring: response.data.is_recurring,
      assignedTo: response.data.assigned_to,
      contactId: response.data.contact_id,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    };
    yield put(tasksSlice.actions.createTaskSuccess(task));
  } catch (error: any) {
    yield put(tasksSlice.actions.createTaskFailure(error.response?.data?.message || 'Failed to create task'));
  }
}

function* getTasksSaga(action: PayloadAction<{ contactId?: number; page?: number; limit?: number }>) {
  try {
    const response = yield call(getTasks, action.payload.contactId, action.payload.page, action.payload.limit);
    const tasks: Task[] = response.data.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      dueTime: task.due_time,
      isRecurring: task.is_recurring,
      assignedTo: task.assigned_to,
      contactId: task.contact_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));
    yield put(tasksSlice.actions.getTasksSuccess({
      tasks,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || 1,
    }));
  } catch (error: any) {
    yield put(tasksSlice.actions.getTasksFailure(error.response?.data?.message || 'Failed to fetch tasks'));
  }
}

function* getTaskByIdSaga(action: PayloadAction<number>) {
  try {
    const response: TaskResponse = yield call(getTaskById, action.payload);
    const task: Task = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      dueDate: response.data.due_date,
      dueTime: response.data.due_time,
      isRecurring: response.data.is_recurring,
      assignedTo: response.data.assigned_to,
      contactId: response.data.contact_id,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    };
    yield put(tasksSlice.actions.getTaskByIdSuccess(task));
  } catch (error: any) {
    yield put(tasksSlice.actions.getTaskByIdFailure(error.response?.data?.message || 'Failed to fetch task'));
  }
}

function* updateTaskSaga(action: PayloadAction<{ id: number; taskData: CreateTaskRequest }>) {
  try {
    const response: TaskResponse = yield call(updateTask, action.payload.id, action.payload.taskData);
    const task: Task = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      dueDate: response.data.due_date,
      dueTime: response.data.due_time,
      isRecurring: response.data.is_recurring,
      assignedTo: response.data.assigned_to,
      contactId: response.data.contact_id,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    };
    yield put(tasksSlice.actions.updateTaskSuccess(task));
  } catch (error: any) {
    yield put(tasksSlice.actions.updateTaskFailure(error.response?.data?.message || 'Failed to update task'));
  }
}

function* deleteTaskSaga(action: PayloadAction<number>) {
  try {
    yield call(deleteTask, action.payload);
    yield put(tasksSlice.actions.deleteTaskSuccess(action.payload));
  } catch (error: any) {
    yield put(tasksSlice.actions.deleteTaskFailure(error.response?.data?.message || 'Failed to delete task'));
  }
}

export function* tasksSaga() {
  yield takeEvery(tasksSlice.actions.createTaskRequest.type, createTaskSaga);
  yield takeEvery(tasksSlice.actions.getTasksRequest.type, getTasksSaga);
  yield takeEvery(tasksSlice.actions.getTaskByIdRequest.type, getTaskByIdSaga);
  yield takeEvery(tasksSlice.actions.updateTaskRequest.type, updateTaskSaga);
  yield takeEvery(tasksSlice.actions.deleteTaskRequest.type, deleteTaskSaga);
}

export const {
  createTaskRequest,
  createTaskSuccess,
  createTaskFailure,
  getTasksRequest,
  getTasksSuccess,
  getTasksFailure,
  getTaskByIdRequest,
  getTaskByIdSuccess,
  getTaskByIdFailure,
  updateTaskRequest,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskRequest,
  deleteTaskSuccess,
  deleteTaskFailure,
  clearError,
} = tasksSlice.actions;

export default tasksSlice.reducer;