'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerComponent } from '@/components/ui/date-picker';
import { useTranslation } from '@/hooks/useTranslation';

export interface CreateMeetingFormData {
  title: string;
  meetingDate: string;
}

type CreateMeetingField = keyof CreateMeetingFormData;

interface BasicInformationSectionProps {
  formData: CreateMeetingFormData;
  onInputChange: (field: CreateMeetingField, value: string) => void;
  disabled?: boolean;
}

// Minimal seed section for the create-meeting page: just the fields needed to
// make a valid Meeting row (title + date). Seat counts and status are seeded by
// the backend and completed on the edit page.
export function BasicInformationSection({
  formData,
  onInputChange,
  disabled = false,
}: BasicInformationSectionProps) {
  const { t } = useTranslation('general-meeting');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('meetingInfo', { defaultValue: 'Meeting Information' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('meetingTitle', { defaultValue: 'Meeting Title' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder={t('meetingTitle', { defaultValue: 'Meeting Title' })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingDate">
              {t('meetingDate', { defaultValue: 'Meeting Date' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <DatePickerComponent
              value={formData.meetingDate}
              onChange={(value) => onInputChange('meetingDate', value)}
              placeholder={t('meetingDate', { defaultValue: 'Meeting Date' })}
              forcePersian={true}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
