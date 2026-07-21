export const accessibilityPolicy = {
  slug: 'accessibility',
  title: 'Accessibility Statement',
  lastUpdated: '2026-07-21',
  sections: [
    {
      id: 'commitment',
      title: 'Our commitment',
      body:
        'Website Servers Ltd trading as meridian wants meridianweather.co.uk to be usable by as many people as possible. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.\n\nThis statement applies to the public meridian weather Service. It follows the spirit of the UK model accessibility statement used for public-sector sites and reflects our duties under the Equality Act 2010 not to discriminate against disabled people in providing services.\n\nStatus: partially compliant with WCAG 2.1 AA. Some parts of the experience do not yet fully meet that standard. This page was last reviewed on 21 July 2026.',
    },
    {
      id: 'how-accessible',
      title: 'How accessible this website is',
      body:
        'We believe most visitors can: navigate primary pages with keyboard focus; use light, dark, or system colour schemes; enlarge text; enable high contrast, underlined links, enhanced focus rings, and a readable system font; reduce motion; skip to main content; and use the site in English (US/UK), German, French, Spanish, Japanese, or Arabic (with right-to-left layout for Arabic).\n\nWe know some people may find parts of the Service difficult. Known issues are listed below.',
    },
    {
      id: 'features',
      title: 'Measures we take',
      body:
        'Semantic landmarks (header, main, footer); optional skip link to #main-content; labelled controls and visible focus styles; preference centre for accessibility and cookie settings; dialogs and sheets with close controls for subscribe, remove-city, and settings flows; cookie banner exposed as a dialog with focus trap; city search presented as a combobox with arrow-key navigation and live region updates for results; weather icons that supplement written condition text rather than replacing it; tabular figures for temperatures; hourly forecasts expose a screen-reader text list equivalent to the visual grid; touch targets sized for many interactive controls; reduced-motion support that suppresses non-essential animation and auto-advancing carousels.',
    },
    {
      id: 'gaps',
      title: 'Non-accessible content',
      body:
        'Some daily forecast rows still pair an icon with a date without a separate visible condition sentence.\n\nWhen Stripe billing is not configured, Settings → Remove ads shows an unavailable status instead of a checkout path.\n\nThird-party Google AdSense units, when consented and loaded, are outside our full editorial control; their accessibility may vary.\n\nThe admin console is operator-facing and is not covered by this public statement.\n\nThe static offline fallback page is English-first (browser language negotiation is best-effort).',
    },
    {
      id: 'feedback',
      title: 'Feedback and contact',
      body:
        'If you find an accessibility problem not listed here, or need information in a different format, email privacy@meridianweather.co.uk with “Accessibility” in the subject line. You may also contact Website Servers Ltd via websiteservers.co.uk.\n\nWe aim to acknowledge accessibility feedback within five working days and to tell you what happens next.',
    },
    {
      id: 'enforcement',
      title: 'Enforcement procedure',
      body:
        'If you are not satisfied with our response, you can contact the Equality and Human Rights Commission (EHRC). For advice in England, Scotland, or Wales, see equalityadvisoryservice.com. Northern Ireland has a separate Equality Commission. Official guidance on website accessibility complaints is published by GOV.UK.',
    },
    {
      id: 'technical',
      title: 'Technical information',
      body:
        'meridian is a Next.js web application. Accessibility depends on a modern browser with JavaScript enabled for interactive features (search, settings, subscriptions). We test primarily with keyboard navigation and browser tooling; we have not published a full audit against every WCAG success criterion or every assistive technology combination.\n\nAssistive technologies we expect to work with reasonable success include recent versions of screen readers (for example NVDA, VoiceOver) and browser zoom up to about 200%, subject to the limitations above.\n\nPreparation of this statement: based on internal self-assessment of the implemented UI and known gaps. We will update this statement when major accessibility work ships.',
    },
  ],
};
