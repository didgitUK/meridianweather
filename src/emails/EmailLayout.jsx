import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const baseStyles = {
  fontFamily: 'Georgia, serif',
  backgroundColor: '#ffffff',
  color: '#111111',
};

export function EmailLayout({ preview, title, children, unsubscribeUrl }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={baseStyles}>
        <Container style={{ padding: '24px', maxWidth: '560px' }}>
          <Text style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            meridian
          </Text>
          <Heading as="h1" style={{ fontSize: '28px', fontWeight: 500, margin: '16px 0' }}>
            {title}
          </Heading>
          {children}
          {unsubscribeUrl ? (
            <Section style={{ marginTop: '32px', borderTop: '1px solid #e5e5e5', paddingTop: '16px' }}>
              <Text style={{ fontSize: '12px', color: '#666666' }}>
                <Link href={unsubscribeUrl}>Unsubscribe</Link> from these emails.
              </Text>
            </Section>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
