import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const NotificationToast = () => {
  const { t } = useTranslation();

  const showSuccessToast = (message) => {
    toast.success(message || t('common.success'));
  };

  const showErrorToast = (message) => {
    toast.error(message || t('common.error'));
  };

  const showInfoToast = (message) => {
    toast(message || t('common.loading'), {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      duration: 3000,
    });
  };

  const showWarningToast = (message) => {
    toast(message || t('common.error'), {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      duration: 4000,
    });
  };

  // Export toast functions for use in other components
  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
    t, // Also export translation function
  };
};

export default NotificationToast;
