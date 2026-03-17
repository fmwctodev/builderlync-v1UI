import { useParams } from 'react-router-dom';

export const useOrgPath = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  
  const getOrgPath = (path: string) => {
    if (!orgSlug) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if(!user.companySlug) return path;
      
      return `/org/${user.companySlug}/${path}`;
    };
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/org/${orgSlug}/${cleanPath}`;
  };

  return { orgSlug, getOrgPath };
};
