import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import { createJobTask, getJobTasks, updateJobTask, deleteJobTask, CreateTaskRequest, Task } from '../services/tasksApi';

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
    yield call(createJobTask, 1, action.payload);
    // Refetch tasks after creation
    yield put(tasksSlice.actions.getTasksRequest({ contactId: 1 }));
  } catch (error: any) {
    yield put(tasksSlice.actions.createTaskFailure(error.response?.data?.message || 'Failed to create task'));
  }
}

function* getTasksSaga(action: PayloadAction<{ contactId?: number; page?: number; limit?: number }>) {
  try {
    const response = yield call(getJobTasks, 1, action.payload.page, action.payload.limit);
    const tasks: Task[] = response.data.data || [];
    yield put(tasksSlice.actions.getTasksSuccess({
      tasks,
      totalPages: response.data.pagination?.totalPages || 1,
      currentPage: response.data.pagination?.page || 1,
    }));
  } catch (error: any) {
    yield put(tasksSlice.actions.getTasksFailure(error.response?.data?.message || 'Failed to fetch tasks'));
  }
}

function* getTaskByIdSaga(action: PayloadAction<number>) {
  try {
    // Since we don't have getTaskById API, we'll fetch all tasks and find the one
    const response = yield call(getJobTasks, 1);
    const task = response.data.data.find((t: Task) => t.id === action.payload);
    if (task) {
      yield put(tasksSlice.actions.getTaskByIdSuccess(task));
    } else {
      yield put(tasksSlice.actions.getTaskByIdFailure('Task not found'));
    }
  } catch (error: any) {
    yield put(tasksSlice.actions.getTaskByIdFailure(error.response?.data?.message || 'Failed to fetch task'));
  }
}

function* updateTaskSaga(action: PayloadAction<{ id: number; taskData: CreateTaskRequest }>) {
  try {
    yield call(updateJobTask, 1, action.payload.id, action.payload.taskData);
    // Refetch tasks after update
    yield put(tasksSlice.actions.getTasksRequest({ contactId: 1 }));
  } catch (error: any) {
    yield put(tasksSlice.actions.updateTaskFailure(error.response?.data?.message || 'Failed to update task'));
  }
}

function* deleteTaskSaga(action: PayloadAction<number>) {
  try {
    yield call(deleteJobTask, 1, action.payload);
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