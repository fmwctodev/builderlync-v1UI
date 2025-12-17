import { useParams } from 'react-router-dom';

export const useOrgPath = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  
  const getOrgPath = (path: string) => {
    if (!orgSlug) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/org/${orgSlug}/${cleanPath}`;
  };

  return { orgSlug, getOrgPath };
};
