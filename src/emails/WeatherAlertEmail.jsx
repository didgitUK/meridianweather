import { Text } from '@react-email/components';
import { EmailLayout } from '@/emails/EmailLayout';
import { formatConditionLabel } from '@/features/weather/utils/formatWeather';

export function WeatherAlertEmail({ cityName, condition, unsubscribeUrl }) {
  const label = formatConditionLabel(condition);

  return (
    <EmailLayout
      preview={`Weather alert for ${cityName}`}
      title={`Weather alert for ${cityName}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text>Conditions have changed to {label}.</Text>
      <Text>Open meridian to review the latest forecast for your saved cities.</Text>
    </EmailLayout>
  );
}
