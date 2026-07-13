import { Text } from '@react-email/components';
import { EmailLayout } from '@/emails/EmailLayout';

export function WelcomeEmail({ email }) {
  return (
    <EmailLayout preview="Welcome to meridian" title="Welcome to meridian">
      <Text>Thanks for subscribing with {email}. We will send product updates sparingly.</Text>
      <Text>Your city selections stay in your browser — no account required.</Text>
    </EmailLayout>
  );
}
