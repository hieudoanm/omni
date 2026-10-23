'use client';

import { AppsStoreTemplate } from '@/components/templates/app/AppsStoreTemplate';
import { getHomeSections } from '@/components/routes/apps/data/apps';

const sections = getHomeSections();

const StartPage = () => <AppsStoreTemplate title='Start Page' sections={sections} />;

export default StartPage;
