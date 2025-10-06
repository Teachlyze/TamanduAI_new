import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {t('error.pageNotFound')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('error.pageNotFoundMessage')}
        </p>
        <Button onClick={() => navigate('/')}>
          {t('common.backToHome')}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
