import { Text } from '@react-email/components';
import { EmailLayout } from '@/emails/EmailLayout';
import { formatConditionLabel, formatTemperature } from '@/features/weather/utils/formatWeather';

/**
 * @param {{
 *   locations: Array<{ cityName: string, weather: object, unsubscribeUrl: string }>,
 *   unsubscribeUrl?: string,
 * }} props
 */
export function WeeklyDigestEmail({ locations = [], unsubscribeUrl }) {
  const names = locations.map((item) => item.cityName).filter(Boolean).join(', ');

  return (
    <EmailLayout
      preview={`Your weekly weather for ${names || 'your locations'}`}
      title="Your weekly weather"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text>
        Here is this week’s snapshot for {locations.length} location
        {locations.length === 1 ? '' : 's'}
        {names ? `: ${names}` : ''}.
      </Text>

      {locations.map((location) => {
        const temp = formatTemperature(location.weather?.temperature);
        const condition = formatConditionLabel(location.weather?.condition);

        return (
          <div key={`${location.cityName}-${location.unsubscribeUrl}`}>
            <Text style={{ fontSize: '18px', fontWeight: 600, marginBottom: 0 }}>
              {location.cityName}
            </Text>
            <Text style={{ marginTop: 8 }}>
              Current conditions: {temp} — {condition}
            </Text>
            <Text>
              Humidity {location.weather?.humidity ?? '—'}% · Wind{' '}
              {location.weather?.windSpeed ?? '—'} m/s
            </Text>
            {location.unsubscribeUrl ? (
              <Text style={{ fontSize: 12 }}>
                <a href={location.unsubscribeUrl}>Stop digest for {location.cityName}</a>
              </Text>
            ) : null}
          </div>
        );
      })}
    </EmailLayout>
  );
}
