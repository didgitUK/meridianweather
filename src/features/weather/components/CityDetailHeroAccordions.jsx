'use client';

import {
  CITY_DETAIL_ACCORDION_CONDITIONS,
  CITY_DETAIL_ACCORDION_LOCATION,
  CITY_DETAIL_ACCORDION_SUN_TIMES,
  CITY_DETAIL_CURRENT_CONDITIONS_ID,
} from '@/constants/city-detail';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { CityDetailLocationGrid } from '@/features/weather/components/CityDetailLocationGrid';
import { CityDetailSunTimesGrid } from '@/features/weather/components/CityDetailSunTimesGrid';
import { CityDetailMetrics } from '@/features/weather/components/CityDetailMetrics';
import { useCityDetailAccordion } from '@/features/weather/hooks/useCityDetailAccordion';

export function CityDetailHeroAccordions({ current, hourlyPoints = [] }) {
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
        <AccordionItem variant="panel" value={CITY_DETAIL_ACCORDION_LOCATION}>
          <AccordionTrigger>Location</AccordionTrigger>
          <AccordionContent>
            <CityDetailLocationGrid current={current} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem variant="panel" value={CITY_DETAIL_ACCORDION_SUN_TIMES}>
          <AccordionTrigger>Sunrise &amp; sunset</AccordionTrigger>
          <AccordionContent>
            <CityDetailSunTimesGrid current={current} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          id={CITY_DETAIL_CURRENT_CONDITIONS_ID}
          variant="panel"
          value={CITY_DETAIL_ACCORDION_CONDITIONS}
          className="scroll-mt-6"
        >
          <AccordionTrigger>Current conditions</AccordionTrigger>
          <AccordionContent>
            <CityDetailMetrics current={current} hourlyPoints={hourlyPoints} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
