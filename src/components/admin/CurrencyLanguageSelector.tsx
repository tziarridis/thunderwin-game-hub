
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from "@/constants/integrationsData";

interface CurrencyLanguageSelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const CurrencyLanguageSelector = ({
  selectedCurrency,
  onCurrencyChange,
  selectedLanguage,
  onLanguageChange,
  className = ""
}: CurrencyLanguageSelectorProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="currency-select">Currency</Label>
        <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency-select">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language-select">Language</Label>
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger id="language-select">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name} {language.native ? `(${language.native})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CurrencyLanguageSelector;
