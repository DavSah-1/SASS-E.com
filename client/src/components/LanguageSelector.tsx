import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, getLanguageName, getLanguageFlag } from '@/lib/i18n';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de'];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{getLanguageFlag(language)} {getLanguageName(language)}</span>
          <span className="sm:hidden">{getLanguageFlag(language)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? 'bg-accent' : ''}
          >
            <span className="mr-2">{getLanguageFlag(lang)}</span>
            {getLanguageName(lang)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
