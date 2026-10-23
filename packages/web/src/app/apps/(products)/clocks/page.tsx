'use client';

import { AppsStoreTemplate } from '@/components/templates/app/AppsStoreTemplate';
import { getAppSections } from '@/components/routes/apps/data/apps';

const CATEGORY = 'clocks';

export default function ClocksCategoryPage() {
  const sections = getAppSections();
  const title = sections.find((s) => s.id === CATEGORY)?.label ?? CATEGORY;
  return <AppsStoreTemplate title={title} sections={sections} section={CATEGORY} />;
}
