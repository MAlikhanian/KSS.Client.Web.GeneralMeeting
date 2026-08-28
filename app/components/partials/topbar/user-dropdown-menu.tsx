import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProfilePhoto } from '@/hooks/use-profile-photo';
import { I18N_LANGUAGES, Language } from '@/i18n/config';
import {
  BetweenHorizontalStart,
  Coffee,
  CreditCard,
  FileText,
  Globe,
  Moon,
  PanelLeft,
  Settings,
  Shield,
  User,
  UserCircle,
  Users,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/providers/i18n-provider';
import { useSettings } from '@/providers/settings-provider';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

interface PersonTranslation {
  languageId: number;
  firstName: string;
  lastName: string;
}

interface PersonDetail {
  nationalId?: string | null;
  translations?: PersonTranslation[];
}

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { data: session } = useSession();
  const profilePhotoUrl = useProfilePhoto();
  const { changeLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { settings, storeOption } = useSettings();
  const { t } = useTranslation();

  const personId = session?.user.personId;
  const { data: person } = useQuery<PersonDetail>({
    queryKey: ['current-person', personId],
    queryFn: async () => {
      const res = await fetch('/api/person/me');
      if (!res.ok) throw new Error('Failed to load person');
      return res.json();
    },
    enabled: !!personId,
    staleTime: 5 * 60 * 1000,
  });

  // Pick a translation: current UI language first, then Persian, then any.
  const currentLanguageId = language.code === 'en' ? 10 : 12;
  const translation =
    person?.translations?.find((tr) => tr.languageId === currentLanguageId) ??
    person?.translations?.find((tr) => tr.languageId === 12) ??
    person?.translations?.[0];
  const personName = translation
    ? `${translation.firstName ?? ''} ${translation.lastName ?? ''}`.trim()
    : '';
  const nationalCode = person?.nationalId || session?.user.name || '';

  const handleLanguage = (lang: Language) => {
    changeLanguage(lang.code);
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleSidebarThemeToggle = (checked: boolean) => {
    storeOption('layouts.demo1.sidebarTheme', checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center p-3">
          <div className="flex items-center gap-2">
            {profilePhotoUrl ? (
              <img
                className="w-9 h-9 rounded-full border border-border object-cover"
                src={profilePhotoUrl}
                alt="User avatar"
              />
            ) : (
              <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm text-mono font-semibold">
                {personName || session?.user.name || ''}
              </span>
              <span className="text-xs text-muted-foreground">
                {nationalCode}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem disabled className="flex items-center gap-2">
          <UserCircle />
          {t('userMenu.publicProfile')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="flex items-center gap-2">
          <User />
          {t('userMenu.myProfile')}
        </DropdownMenuItem>

        {/* My Account Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled className="flex items-center gap-2">
            <Settings />
            {t('userMenu.myAccount')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <Coffee />
              {t('userMenu.getStarted')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <FileText />
              {t('userMenu.myProfile')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <CreditCard />
              {t('userMenu.billing')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <Shield />
              {t('userMenu.security')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <Users />
              {t('userMenu.membersAndRoles')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <BetweenHorizontalStart />
              {t('userMenu.integrations')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem disabled className="flex items-center gap-2">
          <FileText />
          {t('userMenu.devForum')}
        </DropdownMenuItem>

        {/* Language Submenu with Radio Group */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 [&_[data-slot=dropdown-menu-sub-trigger-indicator]]:hidden hover:[&_[data-slot=badge]]:border-input data-[state=open]:[&_[data-slot=badge]]:border-input">
            <Globe />
            <span className="flex items-center justify-between gap-2 grow relative">
              {t('userMenu.language')}
              <Badge
                variant="outline"
                className="absolute end-0 top-1/2 -translate-y-1/2"
              >
                {language.name}
                <img
                  src={language.flag}
                  className="w-3.5 h-3.5 rounded-full"
                  alt={language.name}
                />
              </Badge>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={language.code}
              onValueChange={(value) => {
                const selectedLang = I18N_LANGUAGES.find(
                  (lang) => lang.code === value,
                );
                if (selectedLang) handleLanguage(selectedLang);
              }}
            >
              {I18N_LANGUAGES.map((item) => (
                <DropdownMenuRadioItem
                  key={item.code}
                  value={item.code}
                  className="flex items-center gap-2"
                >
                  <img
                    src={item.flag}
                    className="w-4 h-4 rounded-full"
                    alt={item.name}
                  />
                  <span>{item.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            {t('userMenu.darkMode')}
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <PanelLeft />
          <div className="flex items-center gap-2 justify-between grow">
            {t('userMenu.darkSidebar')}
            <Switch
              size="sm"
              checked={settings.layouts.demo1.sidebarTheme === 'dark'}
              onCheckedChange={handleSidebarThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut()}
          >
            {t('userMenu.logout')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
