import { all, call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchJobsRequest, 
  fetchJobsSuccess, 
  fetchJobsFailure,
  fetchOpportunitiesRequest,
  fetchOpportunitiesSuccess,
  fetchOpportunitiesFailure
} from '../slices';
import { apiService } from '../services/api';

function* fetchJobsSaga(): Generator<any, void, any> {
  try {
    const jobs = yield call(apiService.getJobs);
    yield put(fetchJobsSuccess(jobs));
  } catch (error: any) {
    yield put(fetchJobsFailure(error.message));
  }
}

function* fetchOpportunitiesSaga(): Generator<any, void, any> {
  try {
    const opportunities = yield call(apiService.getOpportunities);
    yield put(fetchOpportunitiesSuccess(opportunities));
  } catch (error: any) {
    yield put(fetchOpportunitiesFailure(error.message));
  }
}

function* watchFetchJobs() {
  yield takeEvery(fetchJobsRequest.type, fetchJobsSaga);
}

function* watchFetchOpportunities() {
  yield takeEvery(fetchOpportunitiesRequest.type, fetchOpportunitiesSaga);
}

export function* rootSaga() {
  yield all([
    watchFetchJobs(),
    watchFetchOpportunities(),
  ]);
}