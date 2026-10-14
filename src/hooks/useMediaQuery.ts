import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  // Start with the same value on server and client; measure after hydration.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}