# User Sync Guide

## What is User Sync?

The User Sync feature allows you to synchronize your External API user account with Supabase authentication. This is necessary because the application uses two separate authentication systems that need to be aligned for all features to work properly.

## Why Do I Need This?

Your application has:
1. **External API Auth** - Used for login/signup
2. **Supabase Auth** - Required for database operations

When you log in via the external API, a Supabase account must also exist for database features (like Staff Management) to work correctly.

## How to Use User Sync

### Step 1: Navigate to User Sync
1. Log in to your application
2. Click on **Settings** in the left sidebar
3. Click on **User Sync** in the settings menu

### Step 2: Check Your Authentication Status
The page will show you:
- **External API Auth Status**: Whether you're logged in via external API
- **Supabase Auth Status**: Whether you have a Supabase session
- **Sync Status**: Whether your accounts need to be synchronized

### Step 3: Sync Your Account

If you see a yellow warning "Sync Required":

1. Your email will be pre-filled from your logged-in account
2. Enter your password (the same one you use to log in)
3. Click **"Sync My Account"**
4. Wait for the sync to complete
5. You'll see a success message when done

### Step 4: Verify Sync
After syncing:
- Both auth status cards should show green checkmarks
- You'll see "Fully Synchronized" message
- All database features will now work correctly

## Troubleshooting

### "User already exists in Supabase"
This means your account is already synced. Try clicking "Sign In to Supabase" instead of "Sync My Account".

### "Password must be at least 6 characters"
Supabase requires passwords to be at least 6 characters long. If your password is shorter, you may need to update it.

### "Failed to create Supabase user"
This could happen if:
- Your email is invalid
- Your password doesn't meet requirements
- There's a network issue

Try refreshing the page and attempting again.

## What Happens After Sync?

Once synced:
1. ✅ You can access Staff Management without errors
2. ✅ Database operations work correctly
3. ✅ All features requiring authentication function properly
4. ✅ No more "Session expired" errors

## Do I Need to Sync Again?

No, once your account is synced, it stays synced. You only need to:
- Log in normally (both systems will authenticate)
- Use the User Sync page if you change your password

## Security Notes

- Your password is never stored or logged
- Syncing creates a secure Supabase Auth account
- Both authentication systems use industry-standard security
- All communication is encrypted

## Need Help?

If you encounter issues:
1. Check the browser console for detailed error messages
2. Try logging out and logging back in
3. Verify your email and password are correct
4. Contact support if problems persist

## Technical Details

### What Actually Happens During Sync?

1. **Account Creation**: Creates a Supabase Auth user with your email/password
2. **Sign In**: Automatically signs you in to Supabase
3. **Session Establishment**: Creates a Supabase session alongside your External API session
4. **Verification**: Confirms both auth systems are active

### For Administrators

If you're managing multiple users:
- Each user must sync their own account (for security)
- Users must know their password to sync
- Syncing doesn't affect existing External API accounts
- Supabase accounts can be managed in Supabase Dashboard

## Future Improvements

The application is moving toward unified authentication with Supabase. This User Sync feature is a bridge solution during the transition period.
