'use client';

import type { FC } from 'react';
import { SettingsTemplate } from '@/components/templates/app/SettingsTemplate';

interface SettingsPageProps {
  language: string;
  theme: string;
  dateTimeFormat: string;
  timezone: string;
  onLanguageChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onDateTimeFormatChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export const SettingsPage: FC<SettingsPageProps> = (props) => <SettingsTemplate {...props} />;

SettingsPage.displayName = 'SettingsPage';
