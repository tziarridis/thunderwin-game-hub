
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from '@/constants/integrationsData';

interface CurrencyLanguageSelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  showLabels?: boolean;
  className?: string;
}

/**
 * Component for selecting currency and language from supported options
 */
const CurrencyLanguageSelector = ({
  selectedCurrency,
  onCurrencyChange,
  selectedLanguage,
  onLanguageChange,
  showLabels = true,
  className = ''
}: CurrencyLanguageSelectorProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div className="space-y-2">
        {showLabels && <Label htmlFor="currency-select">Currency</Label>}
        <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency-select" className="w-full">
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        {showLabels && <Label htmlFor="language-select">Language</Label>}
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger id="language-select" className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.code.toUpperCase()} - {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CurrencyLanguageSelector;
