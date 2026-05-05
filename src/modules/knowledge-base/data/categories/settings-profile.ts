import { User } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-profile',
    name: 'Profile',
    description: 'Your personal user profile, password, and preferences.',
    icon: User,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 1,
  },
  articles: [
    walkthrough({
      slug: 'profile-overview',
      title: 'Profile overview',
      summary: 'What lives in your profile vs business info.',
      categorySlug: 'settings-profile',
      tags: ['profile', 'overview'],
      readMinutes: 3,
      intro: 'Profile is your personal info — name, email, password, MFA. Business info (company name, logo) lives in Business Info.',
      videoDesc: 'Profile tour (90 sec)',
      steps: [
        { title: 'Settings → Profile', text: '', screenshot: 'profile sidebar' },
        { title: 'Personal info', text: 'Name, email, phone.', screenshot: 'personal info' },
        { title: 'Password + MFA', text: '', screenshot: 'security section' },
      ],
    }),
    walkthrough({
      slug: 'change-password',
      title: 'Change your password',
      summary: 'Update your account password.',
      categorySlug: 'settings-profile',
      tags: ['profile', 'password'],
      readMinutes: 2,
      intro: 'Change your password from the Profile page.',
      videoDesc: 'Change password (45 sec)',
      steps: [
        { title: 'Profile → Security', text: '', screenshot: 'security' },
        { title: 'Click Change Password', text: '', screenshot: 'change password button' },
        { title: 'Enter current + new', text: '', screenshot: 'password form' },
      ],
    }),
    walkthrough({
      slug: 'enable-mfa',
      title: 'Enable two-factor authentication',
      summary: 'Add MFA via authenticator app.',
      categorySlug: 'settings-profile',
      tags: ['profile', 'mfa', 'security'],
      readMinutes: 3,
      intro: 'MFA is strongly recommended for owner and admin accounts.',
      videoDesc: 'Enable MFA (90 sec)',
      steps: [
        { title: 'Profile → Security → 2FA', text: '', screenshot: '2fa section' },
        { title: 'Scan QR code', text: 'Use Google Auth, Authy, 1Password.', screenshot: 'qr code' },
        { title: 'Enter code', text: 'Verify pairing.', screenshot: 'verify code' },
        { title: 'Save backup codes', text: 'Use if phone is lost.', screenshot: 'backup codes' },
      ],
    }),
    walkthrough({
      slug: 'email-signature',
      title: 'Set your email signature',
      summary: 'Default signature appended to outbound emails.',
      categorySlug: 'settings-profile',
      tags: ['profile', 'email', 'signature'],
      readMinutes: 2,
      intro: 'Your signature applies to emails you send through BuilderLync.',
      videoDesc: 'Email signature (45 sec)',
      steps: [
        { title: 'Profile → Communications', text: '', screenshot: 'communications section' },
        { title: 'Edit signature', text: 'Rich text editor.', screenshot: 'signature editor' },
        { title: 'Save', text: '', screenshot: 'save' },
      ],
    }),
    walkthrough({
      slug: 'profile-troubleshooting',
      title: 'Profile troubleshooting',
      summary: 'Locked out, MFA lost, email not receiving.',
      categorySlug: 'settings-profile',
      tags: ['profile', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Common profile issues and how to recover.',
      videoDesc: 'Troubleshooting (90 sec)',
      steps: [
        { title: 'Locked out', text: 'Use "Forgot password" on login.', screenshot: 'forgot password' },
        { title: 'Lost MFA device', text: 'Use a backup code. If gone, an Owner can reset.', screenshot: 'backup code use' },
        { title: 'Not receiving email', text: 'Check spam, then ask Owner to verify your email address.', screenshot: 'email check' },
      ],
    }),
  ],
};

export default cm;
