'use client';

import { Suspense } from 'react';
import { Container } from '@/components/common/container';
import { EditMeetingContent } from './content';

export default function EditMeetingPage() {
  return (
    <Container>
      <Suspense>
        <EditMeetingContent />
      </Suspense>
    </Container>
  );
}
