'use client';

import { toAbsoluteUrl } from '@/lib/helpers';
import { Engage } from './engage';
import { useTranslation } from '@/hooks/useTranslation';

export function Help2() {
  const { t } = useTranslation();
  
  return (
    <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5">
      <Engage
        title={t('common.help.questions.title')}
        description={t('common.help.questions.description')}
        image={
          <>
            <img
              src={toAbsoluteUrl('/media/illustrations/29.svg')}
              className="dark:hidden max-h-[150px]"
              alt="image"
            />
            <img
              src={toAbsoluteUrl('/media/illustrations/29-dark.svg')}
              className="light:hidden max-h-[150px]"
              alt="image"
            />
          </>
        }
        more={{ title: t('common.help.questions.goToHelpCenter'), url: '#' }}
      />
      <Engage
        title={t('common.help.contactSupport.title')}
        description={t('common.help.contactSupport.description')}
        image={
          <>
            <img
              src={toAbsoluteUrl('/media/illustrations/31.svg')}
              className="dark:hidden max-h-[150px]"
              alt="image"
            />
            <img
              src={toAbsoluteUrl('/media/illustrations/31-dark.svg')}
              className="light:hidden max-h-[150px]"
              alt="image"
            />
          </>
        }
        more={{
          title: t('common.help.contactSupport.contactSupport'),
          url: 'https://devs.keenthemes.com/unresolved',
        }}
      />
    </div>
  );
}
