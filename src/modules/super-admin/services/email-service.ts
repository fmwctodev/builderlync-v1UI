interface NewAccountWelcomeParams {
  accountName: string;
  accountEmail: string;
  planName: string;
}

interface AccountSuspensionParams {
  accountName: string;
  accountEmail: string;
  reason: string;
}

interface AccountReactivationParams {
  accountName: string;
  accountEmail: string;
}

export async function sendNewAccountWelcomeNotification(params: NewAccountWelcomeParams): Promise<void> {
  console.log('📧 [Email Service] Welcome notification:', params);
}

export async function sendAccountSuspensionNotification(params: AccountSuspensionParams): Promise<void> {
  console.log('📧 [Email Service] Suspension notification:', params);
}

export async function sendAccountReactivationNotification(params: AccountReactivationParams): Promise<void> {
  console.log('📧 [Email Service] Reactivation notification:', params);
}
