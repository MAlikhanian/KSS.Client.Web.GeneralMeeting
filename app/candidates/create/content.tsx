'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/providers/i18n-provider';
import { translateApiError } from '@/lib/format-utils';
import { useCurrentMeeting } from '../../hooks/use-current-meeting';
import { type PersonRecord } from '../../components/person-picker';
import { BasicInformationSection, type CreateCandidateFormData } from './components/basic-information-section';

const FA = 12;
const EN = 10;

const TINT =
  '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
  '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
  'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
  'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
  '[&_div.rounded-xl.bg-card]:shadow-lg ' +
  '[&_div.rounded-xl.bg-card]:shadow-black/5';

export function CreateCandidateContent() {
  const { t } = useTranslation('general-meeting');
  const { language } = useLanguage();
  const langId = language.code === 'en' ? EN : FA;
  const router = useRouter();
  const { meeting } = useCurrentMeeting();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [formData, setFormData] = useState<CreateCandidateFormData>({ personId: null, companyId: null });

  // Person directory (for the picker).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/general-meeting/api/general-meeting/persons');
        if (res.ok && !cancelled) setPersons(await res.json());
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: CreateCandidateFormData) => {
      if (!meeting) throw new Error('No meeting is currently open.');
      const res = await fetch('/general-meeting/api/general-meeting/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id, personId: data.personId, companyId: data.companyId }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Failed to add candidate');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="success">
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>{t('candidateAdded', { defaultValue: 'Candidate added' })}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
      router.push('/candidates');
    },
    onError: (error: Error) => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive">
            <AlertIcon>
              <RiErrorWarningFill />
            </AlertIcon>
            <AlertTitle>{translateApiError(error.message, t)}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
    },
  });

  const isSubmitting = mutation.status === 'pending';
  const isValid = Boolean(formData.personId && formData.companyId && meeting);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-5 lg:space-y-7.5">
      <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
        <Card className="bg-blue-50! dark:bg-blue-950/25! shadow-lg shadow-black/5">
          <CardContent className="py-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle text={t('createCandidateTitle', { defaultValue: 'Add Candidate' })} />
                <ToolbarDescription>
                  {t('createCandidateDescription', {
                    defaultValue: 'Register a board-election candidate for the current meeting',
                  })}
                </ToolbarDescription>
              </ToolbarHeading>
            </Toolbar>
          </CardContent>
        </Card>
      </div>

      {!meeting ? (
        <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t('electionNoMeeting', { defaultValue: 'No meeting is currently open.' })}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={TINT}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:gap-7.5">
              <BasicInformationSection
                formData={formData}
                onPersonChange={(id) => setFormData((p) => ({ ...p, personId: id }))}
                onCompanyChange={(id) => setFormData((p) => ({ ...p, companyId: id }))}
                persons={persons}
                langId={langId}
              />

              <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('operations', { defaultValue: 'Operations' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end space-x-4 space-x-reverse">
                      <Button type="submit" disabled={isSubmitting || !isValid}>
                        <Save className="h-4 w-4" />
                        {isSubmitting
                          ? t('processing', { defaultValue: 'Processing...' })
                          : t('addCandidate', { defaultValue: 'Add Candidate' })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
