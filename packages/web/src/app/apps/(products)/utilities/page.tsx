'use client';

import { AppsStoreTemplate } from '@/components/templates/app/AppsStoreTemplate';
import { getAppSections } from '@/components/routes/apps/data/apps';

const CATEGORY = 'utilities';

export default function UtilitiesCategoryPage() {
  const sections = getAppSections();
  const title = sections.find((s) => s.id === CATEGORY)?.label ?? CATEGORY;
  return <AppsStoreTemplate title={title} sections={sections} section={CATEGORY} />;
}
