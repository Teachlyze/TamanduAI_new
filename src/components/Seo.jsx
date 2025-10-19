import React from 'react';
import { Helmet } from 'react-helmet-async';

const baseUrl = (import.meta?.env?.VITE_APP_URL || 'https://tamanduai.com').replace(/\/$/, '');

export default function Seo({
  title = 'TamanduAI — Plataforma EdTech Inteligente',
  description = 'IA educacional para alunos, professores e escolas: banco de questões, quizzes, correção automática, analytics e gestão escolar.',
  path = '/',
  image = baseUrl + '/og-cover.jpg',
  noindex = false,
}) {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TamanduAI" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
