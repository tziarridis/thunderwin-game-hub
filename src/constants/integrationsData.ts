
/**
 * Constants for integration data based on the API documentation
 * Source: https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4
 */

// Supported currencies from the API
export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "DKK", name: "Danish Krone" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "ZAR", name: "South African Rand" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "THB", name: "Thai Baht" },
  { code: "KRW", name: "South Korean Won" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "RON", name: "Romanian Leu" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "HRK", name: "Croatian Kuna" },
  { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "BOB", name: "Bolivian Boliviano" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "UYU", name: "Uruguayan Peso" },
  { code: "PYG", name: "Paraguayan Guaraní" }
];

// Supported languages from the API
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "nl", name: "Dutch" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "el", name: "Greek" },
  { code: "hr", name: "Croatian" },
  { code: "sr", name: "Serbian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lv", name: "Latvian" },
  { code: "et", name: "Estonian" },
  { code: "uk", name: "Ukrainian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ur", name: "Urdu" },
  { code: "fa", name: "Persian" },
  { code: "he", name: "Hebrew" }
];

// Game types as defined in the API
export const GAME_TYPES = [
  { code: "slots", name: "Slots" },
  { code: "table", name: "Table Games" },
  { code: "live", name: "Live Casino" },
  { code: "jackpot", name: "Jackpot Games" },
  { code: "crash", name: "Crash Games" },
  { code: "scratch", name: "Scratch Cards" },
  { code: "lottery", name: "Lottery" },
  { code: "virtual", name: "Virtual Sports" },
  { code: "poker", name: "Poker" },
  { code: "bingo", name: "Bingo" },
  { code: "other", name: "Other Games" }
];

// Game technologies
export const GAME_TECHNOLOGIES = [
  { code: "html5", name: "HTML5" },
  { code: "flash", name: "Flash" },
  { code: "mobile", name: "Mobile Only" },
  { code: "desktop", name: "Desktop Only" },
  { code: "native", name: "Native App" }
];

// Game distribution channels
export const DISTRIBUTION_CHANNELS = [
  { code: "direct", name: "Direct Integration" },
  { code: "aggregator", name: "Via Aggregator" },
  { code: "iframe", name: "iFrame Embed" },
  { code: "redirect", name: "Redirect URL" }
];

// Seamless wallet callback types
export const SEAMLESS_CALLBACK_TYPES = [
  { type: "balance", description: "Get player balance" },
  { type: "bet", description: "Process bet transaction" },
  { type: "win", description: "Process win transaction" },
  { type: "refund", description: "Process refund transaction" },
  { type: "rollback", description: "Rollback a transaction" },
  { type: "bonus", description: "Bonus transaction" }
];

// Transaction status codes
export const TRANSACTION_STATUSES = [
  { code: 0, status: "Success", description: "Transaction processed successfully" },
  { code: 1, status: "Generic Error", description: "General processing error" },
  { code: 2, status: "Invalid Request", description: "Request parameters are invalid" },
  { code: 3, status: "Insufficient Funds", description: "Player has insufficient funds" },
  { code: 4, status: "Transaction Not Found", description: "Referenced transaction not found" },
  { code: 5, status: "Player Not Found", description: "Player account not found" },
  { code: 6, status: "Duplicate Transaction", description: "Transaction with ID already exists" },
  { code: 7, status: "Game Not Available", description: "Game is not available" },
  { code: 8, status: "Technical Error", description: "Technical issue occurred" }
];
