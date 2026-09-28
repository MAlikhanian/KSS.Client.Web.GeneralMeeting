'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export interface FaqItem {
  title: string;
  text: string;
}

export type FaqItems = Array<FaqItem>;

export function Faq() {
  const { t } = useTranslation();
  
  const items: FaqItems = [
    {
      title: t('common.faq.items.pricingDetermined.title'),
      text: t('common.faq.items.pricingDetermined.text'),
    },
    {
      title: t('common.faq.items.paymentMethods.title'),
      text: t('common.faq.items.paymentMethods.text'),
    },
    {
      title: t('common.faq.items.hiddenFees.title'),
      text: t('common.faq.items.hiddenFees.text'),
    },
    {
      title: t('common.faq.items.annualDiscount.title'),
      text: t('common.faq.items.annualDiscount.text'),
    },
    {
      title: t('common.faq.items.refunds.title'),
      text: t('common.faq.items.refunds.text'),
    },
    {
      title: t('common.faq.items.extraFeatures.title'),
      text: t('common.faq.items.extraFeatures.text'),
    },
  ];

  const generateItems = () => {
    return (
      <Accordion type="single" collapsible>
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.text}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('common.faq.title')}</CardTitle>
      </CardHeader>
      <CardContent className="py-3">{generateItems()}</CardContent>
    </Card>
  );
}
