// Supported languages for translation and speech
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", speechCode: "en-US" },
  { code: "es", name: "Spanish", speechCode: "es-ES" },
  { code: "fr", name: "French", speechCode: "fr-FR" },
  { code: "de", name: "German", speechCode: "de-DE" },
  { code: "it", name: "Italian", speechCode: "it-IT" },
  { code: "pt", name: "Portuguese", speechCode: "pt-PT" },
  { code: "zh", name: "Chinese (Mandarin)", speechCode: "zh-CN" },
  { code: "ja", name: "Japanese", speechCode: "ja-JP" },
  { code: "ko", name: "Korean", speechCode: "ko-KR" },
  { code: "ru", name: "Russian", speechCode: "ru-RU" },
  { code: "ar", name: "Arabic", speechCode: "ar-SA" },
  { code: "hi", name: "Hindi", speechCode: "hi-IN" },
  { code: "nl", name: "Dutch", speechCode: "nl-NL" },
  { code: "pl", name: "Polish", speechCode: "pl-PL" },
  { code: "tr", name: "Turkish", speechCode: "tr-TR" },
  { code: "sv", name: "Swedish", speechCode: "sv-SE" },
  { code: "no", name: "Norwegian", speechCode: "nb-NO" },
  { code: "da", name: "Danish", speechCode: "da-DK" },
  { code: "fi", name: "Finnish", speechCode: "fi-FI" },
  { code: "el", name: "Greek", speechCode: "el-GR" },
] as const;

export function getLanguageByName(name: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.name.toLowerCase() === name.toLowerCase());
}

export function getLanguageByCode(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function getSpeechRecognitionLanguage(languageName: string): string {
  const lang = getLanguageByName(languageName);
  return lang?.speechCode || "en-US";
}

export function getSpeechSynthesisLanguage(languageName: string): string {
  const lang = getLanguageByName(languageName);
  return lang?.speechCode || "en-US";
}

