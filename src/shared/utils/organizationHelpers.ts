/**
 * Organization Context Helpers
 *
 * Utilities for enforcing organization-scoped data access
 * and preventing data leakage across organizations.
 */

export class OrganizationContextError extends Error {
  constructor(message: string = 'Organization context is required but not available') {
    super(message);
    this.name = 'OrganizationContextError';
  }
}

/**
 * Throws an error if organization ID is not provided.
 * Use this at the start of any function that requires organization context.
 *
 * @param organizationId - The organization ID to validate
 * @param context - Optional context string for better error messages
 * @throws OrganizationContextError if organizationId is null/undefined
 *
 * @example
 * async function getContacts(organizationId: string | null) {
 *   requireOrganizationId(organizationId, 'getContacts');
 *   // Safe to use organizationId here
 * }
 */
export function requireOrganizationId(
  organizationId: string | null | undefined,
  context?: string
): asserts organizationId is string {
  if (!organizationId) {
    const message = context
      ? `Organization context is required for ${context}`
      : 'Organization context is required';

    if (process.env.NODE_ENV === 'development') {
      console.error(`[OrganizationContext] ${message}`, {
        context,
        stack: new Error().stack,
      });
    }

    throw new OrganizationContextError(message);
  }
}

/**
 * Adds organization_id to a data object.
 * Useful for INSERT operations to ensure organization_id is always included.
 *
 * @param data - The data object to augment
 * @param organizationId - The organization ID to add
 * @returns The data object with organization_id added
 *
 * @example
 * const contactData = { name: 'John', email: 'john@example.com' };
 * const withOrg = withOrgId(contactData, currentOrgId);
 * // Result: { name: 'John', email: 'john@example.com', organization_id: 'uuid' }
 */
export function withOrgId<T extends Record<string, any>>(
  data: T,
  organizationId: string | null | undefined
): T & { organization_id: string } {
  requireOrganizationId(organizationId, 'withOrgId');

  return {
    ...data,
    organization_id: organizationId,
  };
}

/**
 * Validates that a retrieved record belongs to the expected organization.
 * Use after fetching data to ensure it belongs to the current organization context.
 *
 * @param record - The record to validate (can be null)
 * @param expectedOrgId - The expected organization ID
 * @param recordType - Type of record for error messages
 * @returns The record if valid, null if record is null
 * @throws OrganizationContextError if organization IDs don't match
 *
 * @example
 * const contact = await supabase.from('contacts').select().eq('id', id).maybeSingle();
 * validateOrgAccess(contact.data, currentOrgId, 'contact');
 */
export function validateOrgAccess<T extends { organization_id?: string | null }>(
  record: T | null,
  expectedOrgId: string | null | undefined,
  recordType?: string
): T | null {
  if (!record) {
    return null;
  }

  requireOrganizationId(expectedOrgId, 'validateOrgAccess');

  if (record.organization_id && record.organization_id !== expectedOrgId) {
    const message = recordType
      ? `${recordType} does not belong to the current organization`
      : 'Record does not belong to the current organization';

    if (process.env.NODE_ENV === 'development') {
      console.error(`[OrganizationContext] Access violation`, {
        recordType,
        recordOrgId: record.organization_id,
        expectedOrgId,
      });
    }

    throw new OrganizationContextError(message);
  }

  return record;
}

/**
 * Validates that all records in an array belong to the expected organization.
 *
 * @param records - Array of records to validate
 * @param expectedOrgId - The expected organization ID
 * @param recordType - Type of records for error messages
 * @returns The records array if all valid
 * @throws OrganizationContextError if any record doesn't match
 */
export function validateOrgAccessBulk<T extends { organization_id?: string | null }>(
  records: T[],
  expectedOrgId: string | null | undefined,
  recordType?: string
): T[] {
  requireOrganizationId(expectedOrgId, 'validateOrgAccessBulk');

  for (const record of records) {
    if (record.organization_id && record.organization_id !== expectedOrgId) {
      const message = recordType
        ? `One or more ${recordType} records do not belong to the current organization`
        : 'One or more records do not belong to the current organization';

      if (process.env.NODE_ENV === 'development') {
        console.error(`[OrganizationContext] Bulk access violation`, {
          recordType,
          violatingOrgId: record.organization_id,
          expectedOrgId,
        });
      }

      throw new OrganizationContextError(message);
    }
  }

  return records;
}

/**
 * Type guard to check if an organization ID is valid (non-null string).
 *
 * @param organizationId - The organization ID to check
 * @returns true if organizationId is a non-empty string
 */
export function hasOrganizationContext(
  organizationId: string | null | undefined
): organizationId is string {
  return typeof organizationId === 'string' && organizationId.length > 0;
}

/**
 * Development mode warning for queries without organization filtering.
 * Only logs in development to help catch missing organization filters.
 *
 * @param functionName - Name of the function for logging
 * @param hasOrgFilter - Whether the query includes organization filtering
 */
export function warnMissingOrgFilter(functionName: string, hasOrgFilter: boolean): void {
  if (process.env.NODE_ENV === 'development' && !hasOrgFilter) {
    console.warn(
      `[OrganizationContext] ${functionName} is executing without explicit organization filtering. ` +
      `This may cause data leakage or performance issues.`
    );
  }
}

/**
 * TypeScript utility type for data that must include organization_id
 */
export type OrganizationScoped<T> = T & { organization_id: string };

/**
 * TypeScript utility type for optional data that may include organization_id
 */
export type MaybeOrganizationScoped<T> = T & { organization_id?: string | null };

/**
 * Interface for API functions that require organization context
 */
export interface RequiresOrganization {
  organizationId: string;
}

/**
 * Helper to create a standardized error response when organization context is missing
 */
export function createOrgContextError(operation: string): Error {
  return new OrganizationContextError(
    `Cannot ${operation} without organization context. Please ensure you are logged in and have selected an organization.`
  );
}
