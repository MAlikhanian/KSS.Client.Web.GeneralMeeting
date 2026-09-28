'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useProfilePhoto() {
  const { data: session } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.personId) {
      setPhotoUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    const loadPhoto = async () => {
      try {
        const response = await fetch('/api/auth/profile-photo');
        if (!response.ok) {
          setPhotoUrl(null);
          return;
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPhotoUrl(objectUrl);
      } catch {
        setPhotoUrl(null);
      }
    };

    loadPhoto();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [session?.user?.personId]);

  return photoUrl;
}
