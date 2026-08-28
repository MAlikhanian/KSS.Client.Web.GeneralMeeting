'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Save, ArrowLeft } from 'lucide-react';
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
import type { MeetingViewDto } from '@/services/general-meeting-api';
import { BasicInformationSection, type EditMeetingFormData } from './components/basic-information-section';

const empty: EditMeetingFormData = {
  title: '',
  meetingDate: '',
  boardSeatCount: 7,
  alternateSeatCount: 2,
  maxSelectionsPerBallot: 7,
  totalMembers: 0,
};

const TINT =
  '[&_div.rounded-xl.bg-card]:bg-blue-50! ' +
  '[&_div.rounded-xl.bg-card]:border-blue-100! ' +
  'dark:[&_div.rounded-xl.bg-card]:bg-blue-950/25! ' +
  'dark:[&_div.rounded-xl.bg-card]:border-blue-900! ' +
  '[&_div.rounded-xl.bg-card]:shadow-lg ' +
  '[&_div.rounded-xl.bg-card]:shadow-black/5';

export function EditMeetingContent() {
  const { t } = useTranslation('general-meeting');
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<EditMeetingFormData>(empty);

  const { data: meetings } = useQuery<MeetingViewDto[]>({
    queryKey: ['gm-meetings'],
    queryFn: async () => {
      const res = await fetch('/general-meeting/api/general-meeting/meetings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load meetings');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const meeting = useMemo(() => meetings?.find((m) => m.id === id) ?? null, [meetings, id]);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        meetingDate: meeting.meetingDate,
        boardSeatCount: meeting.boardSeatCount,
        alternateSeatCount: meeting.alternateSeatCount,
        maxSelectionsPerBallot: meeting.maxSelectionsPerBallot,
        totalMembers: meeting.totalMembers,
      });
    }
  }, [meeting]);

  const handleInputChange = (field: keyof EditMeetingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (data: EditMeetingFormData) => {
      const res = await fetch('/general-meeting/api/general-meeting/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: data.title.trim(),
          meetingDate: data.meetingDate,
          boardSeatCount: data.boardSeatCount,
          alternateSeatCount: data.alternateSeatCount,
          maxSelectionsPerBallot: data.maxSelectionsPerBallot,
          totalMembers: data.totalMembers,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Failed to save meeting');
      }
    },
    onSuccess: () => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="success">
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>{t('meetingSaved', { defaultValue: 'Meeting saved' })}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
      queryClient.invalidateQueries({ queryKey: ['gm-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['gm-current-meeting'] });
      router.push('/meetings');
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
  const isValid =
    formData.title.trim() !== '' &&
    formData.meetingDate.trim() !== '' &&
    formData.boardSeatCount > 0 &&
    formData.maxSelectionsPerBallot > 0;

  // Loaded but the id doesn't match any meeting (or no id at all).
  const noSelection = !id || (Array.isArray(meetings) && !meeting);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-5 lg:space-y-7.5">
      {/* Title card outside the tint wrapper so its border override wins. */}
      <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
        <Card className="bg-blue-50! dark:bg-blue-950/25! shadow-lg shadow-black/5">
          <CardContent className="py-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle text={t('editMeetingTitle', { defaultValue: 'Edit Meeting' })} />
                <ToolbarDescription>
                  {t('editMeetingDescription', { defaultValue: 'Update the meeting settings' })}
                </ToolbarDescription>
              </ToolbarHeading>
            </Toolbar>
          </CardContent>
        </Card>
      </div>

      {noSelection ? (
        <div className="[&_div.rounded-xl.bg-card.bg-card]:border-black! dark:[&_div.rounded-xl.bg-card.bg-card]:border-white!">
          <Card>
            <CardContent className="space-y-3 py-10 text-center text-muted-foreground">
              <p>
                {t('noMeetingSelected', {
                  defaultValue: 'No meeting selected. Choose a meeting from the list to edit.',
                })}
              </p>
              <Button variant="outline" onClick={() => router.push('/meetings')}>
                <ArrowLeft className="size-4" />
                {t('backToMeetings', { defaultValue: 'Back to meetings' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={TINT}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Section 1 — base info, blue border to match the blue badge. */}
              <div className="[&_div.rounded-xl.bg-card.bg-card]:border-blue-500! dark:[&_div.rounded-xl.bg-card.bg-card]:border-blue-500!">
                <BasicInformationSection
                  formData={formData}
                  onInputChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* Operations card — last, black/white border. */}
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
                          : t('saveMeeting', { defaultValue: 'Save Meeting' })}
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
