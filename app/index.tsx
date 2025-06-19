import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash screen immediately
    router.replace('/splash');
  }, []);

  return null;
}