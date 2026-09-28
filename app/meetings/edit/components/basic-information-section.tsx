'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerComponent } from '@/components/ui/date-picker';
import { useTranslation } from '@/hooks/useTranslation';
import { toEnglishDigits } from '@/app/components/person/format-utils';

export interface EditMeetingFormData {
  title: string;
  meetingDate: string;
  boardSeatCount: number;
  alternateSeatCount: number;
  maxSelectionsPerBallot: number;
  totalMembers: number;
}

type EditMeetingField = keyof EditMeetingFormData;

interface BasicInformationSectionProps {
  formData: EditMeetingFormData;
  onInputChange: (field: EditMeetingField, value: string | number) => void;
  disabled?: boolean;
}

// Base-info section (kind = flat fields → blue badge #1). Numeric seat inputs are
// normalized with toEnglishDigits so Persian digits are accepted.
const toInt = (v: string) => Number(toEnglishDigits(v).replace(/[^0-9]/g, '') || 0);

export function BasicInformationSection({
  formData,
  onInputChange,
  disabled = false,
}: BasicInformationSectionProps) {
  const { t } = useTranslation('general-meeting');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            1
          </span>
          {t('meetingInfo', { defaultValue: 'Meeting Information' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              forcePersian={true}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="boardSeatCount">
              {t('boardSeatCount', { defaultValue: 'Board Seats' })}
            </Label>
            <Input
              id="boardSeatCount"
              type="text"
              inputMode="numeric"
              value={String(formData.boardSeatCount)}
              onChange={(e) => onInputChange('boardSeatCount', toInt(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternateSeatCount">
              {t('alternateSeatCount', { defaultValue: 'Alternate Seats' })}
            </Label>
            <Input
              id="alternateSeatCount"
              type="text"
              inputMode="numeric"
              value={String(formData.alternateSeatCount)}
              onChange={(e) => onInputChange('alternateSeatCount', toInt(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSelectionsPerBallot">
              {t('maxSelectionsPerBallot', { defaultValue: 'Max Selections per Ballot' })}
            </Label>
            <Input
              id="maxSelectionsPerBallot"
              type="text"
              inputMode="numeric"
              value={String(formData.maxSelectionsPerBallot)}
              onChange={(e) => onInputChange('maxSelectionsPerBallot', toInt(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalMembers">
              {t('totalMembers', { defaultValue: 'Total Members' })}
            </Label>
            <Input
              id="totalMembers"
              type="text"
              inputMode="numeric"
              value={String(formData.totalMembers)}
              onChange={(e) => onInputChange('totalMembers', toInt(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
