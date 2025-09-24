import React from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../hooks/useLanguage';

const LanguageToggle = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(currentLanguage === 'vi' ? 'en' : 'vi');
  };

  return (
    <Button variant="ghost" size="icon" className="!bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0" onClick={toggleLanguage}>
      <span className="text-sm font-medium">
        {currentLanguage === 'vi' ? 'VI' : 'EN'}
      </span>
    </Button>
  );
};

export { LanguageToggle };
