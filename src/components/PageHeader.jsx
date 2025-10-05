import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const PageHeader = ({
  title,
  description,
  className,
  children,
  titleKey,
  descriptionKey
}) => {
  const { t } = useTranslation();

  // Use translation keys if provided, otherwise use direct text
  const displayTitle = titleKey ? t(titleKey) : title;
  const displayDescription = descriptionKey ? t(descriptionKey) : description;

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <h1 className="text-3xl font-bold tracking-tight">
        {displayTitle}
      </h1>
      {displayDescription && (
        <p className="text-muted-foreground">
          {displayDescription}
        </p>
      )}
      {children}
    </div>
  );
};

export default PageHeader;
