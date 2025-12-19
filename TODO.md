# TODO: Make organization ID dynamic in mockFilesApi

- [x] Modify getOrganizationId() in src/shared/services/mockFilesApi.ts to return localStorage.getItem('currentOrganizationId') || 'mock-org-id'
- [ ] Test the change to ensure it picks up the dynamic organization ID
