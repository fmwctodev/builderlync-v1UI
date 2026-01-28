# TODO: Fix RTK-Query Middleware Warning

## Completed Tasks
- [x] Analyzed the error: "Middleware for RTK-Query API at reducerPath 'dashboardApi' has not been added to the store"
- [x] Examined store configuration in `src/shared/store/index.ts`
- [x] Found that `dashboardApi.middleware` is already added to the middleware array
- [x] Identified potential issue: `thunk: false` in getDefaultMiddleware might be disabling thunk middleware that RTK-Query needs
- [x] Removed `thunk: false` from getDefaultMiddleware configuration

## Next Steps
- [ ] Test the application to verify the warning is resolved
- [ ] If warning persists, investigate further for other potential causes
