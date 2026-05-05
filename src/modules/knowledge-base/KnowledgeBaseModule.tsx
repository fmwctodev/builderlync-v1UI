import React from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { KnowledgeBaseLayout } from './layout/KnowledgeBaseLayout';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import { findRedirect } from './data';

/**
 * Knowledge Base — its own module mounted under /support/knowledge-base/*
 * inside RoofRunnerModule. Has its own internal layout (sidebar + topbar)
 * and three views: Home, Category, Article.
 *
 * URL structure (under /org/:orgSlug):
 *   /support/knowledge-base                                → Home
 *   /support/knowledge-base/:categorySlug                  → Category
 *   /support/knowledge-base/:categorySlug/:articleSlug     → Article
 *
 * Renamed slugs from the v1 KB redirect via the redirect catcher.
 */
export const KnowledgeBaseModule: React.FC = () => {
  return (
    <Routes>
      <Route element={<KnowledgeBaseLayout />}>
        <Route index element={<Home />} />
        <Route path=":categorySlug" element={<RedirectAware kind="category" />} />
        <Route path=":categorySlug/:articleSlug" element={<RedirectAware kind="article" />} />
      </Route>
    </Routes>
  );
};

/**
 * Wraps Category / Article and intercepts known-renamed slugs to
 * Navigate-replace to the new URL. This preserves inbound links from the
 * v1 KB's old slugs (e.g. csv-import → import-contacts-from-csv).
 */
const RedirectAware: React.FC<{ kind: 'category' | 'article' }> = ({ kind }) => {
  const params = useParams<{ categorySlug?: string; articleSlug?: string; orgSlug?: string }>();
  const location = useLocation();

  const path =
    kind === 'category'
      ? params.categorySlug ?? ''
      : `${params.categorySlug}/${params.articleSlug}`;

  const target = findRedirect(path);
  if (target && target !== path) {
    const orgPrefix = params.orgSlug ? `/org/${params.orgSlug}` : '';
    return <Navigate to={`${orgPrefix}/support/knowledge-base/${target}`} replace state={{ from: location }} />;
  }

  return kind === 'category' ? <Category /> : <Article />;
};

export default KnowledgeBaseModule;
