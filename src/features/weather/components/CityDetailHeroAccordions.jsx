'use client';

import { useTranslations } from 'next-intl';
import {
  CITY_DETAIL_ACCORDION_CONDITIONS,
  CITY_DETAIL_CURRENT_CONDITIONS_ID,
} from '@/constants/city-detail';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { CityDetailMetrics } from '@/features/weather/components/CityDetailMetrics';
import { useCityDetailAccordion } from '@/features/weather/hooks/useCityDetailAccordion';

export function CityDetailHeroAccordions({ current, hourlyPoints = [] }) {
  const t = useTranslations('CityDetail.hero');
  const { openSections, setOpenSections } = useCityDetailAccordion();

  if (!current) {
    return null;
  }

  return (
    <>
      <Separator className="my-4 sm:my-6" />
      <Accordion
        variant="panel"
        multiple
        value={openSections}
        onValueChange={setOpenSections}
      >
        <AccordionItem
          id={CITY_DETAIL_CURRENT_CONDITIONS_ID}
          variant="panel"
          value={CITY_DETAIL_ACCORDION_CONDITIONS}
          className="scroll-mt-6"
        >
          <AccordionTrigger>{t('currentConditions')}</AccordionTrigger>
          <AccordionContent>
            <CityDetailMetrics current={current} hourlyPoints={hourlyPoints} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
