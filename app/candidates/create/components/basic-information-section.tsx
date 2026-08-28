'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { PersonPicker, type PersonRecord } from '../../../components/person-picker';
import { MemberPicker } from '../../../components/member-picker';

export interface CreateCandidateFormData {
  personId: string | null;
  companyId: string | null;
}

interface BasicInformationSectionProps {
  formData: CreateCandidateFormData;
  onPersonChange: (id: string | null) => void;
  onCompanyChange: (id: string | null) => void;
  persons: PersonRecord[];
  langId: number;
}

// Seed section for the create-candidate page: the person and the member company
// they represent. That is all a MeetingCandidate row needs.
export function BasicInformationSection({
  formData,
  onPersonChange,
  onCompanyChange,
  persons,
  langId,
}: BasicInformationSectionProps) {
  const { t } = useTranslation('general-meeting');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('candidateInfo', { defaultValue: 'Candidate' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              {t('candidateNameCol', { defaultValue: 'Candidate' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <PersonPicker persons={persons} value={formData.personId} onChange={onPersonChange} langId={langId} />
          </div>

          <div className="space-y-2">
            <Label>
              {t('memberCompany', { defaultValue: 'Company' })}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <MemberPicker value={formData.companyId} onChange={onCompanyChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
