'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiInformationFill } from '@remixicon/react';
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
import { translateApiError } from '@/lib/format-utils';
import { BasicInformationSection, type CreateMeetingFormData } from './components/basic-information-section';

const initialFormData: CreateMeetingFormData = { title: '', meetingDate: '' };

export function CreateMeetingContent() {
  const { t } = useTranslation('general-meeting');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateMeetingFormData>(initialFormData);

  const handleInputChange = (field: keyof CreateMeetingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateMeetingFormData) => {
      // Seed a new (non-current, Open) meeting; backend owns the v7 id + status.
      const response = await fetch('/general-meeting/api/general-meeting/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: data.title.trim(), meetingDate: data.meetingDate }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create meeting');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="success">
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>{t('meetingCreated', { defaultValue: 'Meeting created' })}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
      queryClient.invalidateQueries({ queryKey: ['gm-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['gm-current-meeting'] });
      // Hand the new id to the edit page to complete the meeting's settings.
      if (data?.id) router.push(`/meetings/edit?id=${data.id}`);
      else router.push('/meetings');
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
  const isValid = formData.title.trim() !== '' && formData.meetingDate.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/* Title Card sits OUTSIDE the tint wrapper so its border override wins. */}
      <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
        <Card className="bg-blue-50! dark:bg-blue-950/25! shadow-lg shadow-black/5">
          <CardContent className="py-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle text={t('createMeetingTitle', { defaultValue: 'Create Meeting' })} />
                <ToolbarDescription>
                  {t('createMeetingDescription', { defaultValue: 'Register a new general meeting' })}
                </ToolbarDescription>
              </ToolbarHeading>
            </Toolbar>
          </CardContent>
        </Card>
      </div>

      {/* Blue glass tint on every section Card — identical to /person/create. */}
      <div
        className={
          '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
          '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
          'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
          'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
          '[&_div.rounded-xl.bg-card]:shadow-lg ' +
          '[&_div.rounded-xl.bg-card]:shadow-black/5'
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:gap-7.5">
            <BasicInformationSection
              formData={formData}
              onInputChange={handleInputChange}
              disabled={isSubmitting}
            />

            {/* Operations box — mirrors the edit page's operations card. */}
            <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
              <Card>
                <CardHeader>
                  <CardTitle>{t('operations', { defaultValue: 'Operations' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-start gap-2">
                    <RiInformationFill className="text-blue-600 dark:text-blue-400 size-5 shrink-0 mt-0.5" />
                    <span className="text-sm text-card-foreground">
                      {t('meetingCreateInfo', {
                        defaultValue:
                          'After creating the meeting you will be taken to the edit page to complete its settings. The new meeting is not active until you set it as current.',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-4 space-x-reverse">
                    <Button type="submit" disabled={isSubmitting || !isValid}>
                      <Save className="h-4 w-4" />
                      {isSubmitting
                        ? t('processing', { defaultValue: 'Processing...' })
                        : t('createMeeting', { defaultValue: 'Create Meeting' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
