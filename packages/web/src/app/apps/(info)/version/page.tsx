'use client';

import { VersionTemplate } from '@/components/templates/app/VersionTemplate';
import { buildVersion } from '@/content/version';
import { NextPage } from 'next';

const VersionPage: NextPage = () => <VersionTemplate version={buildVersion} />;

export default VersionPage;
