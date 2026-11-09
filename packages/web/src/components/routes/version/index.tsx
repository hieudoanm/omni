import type { FC } from 'react';
import { VersionTemplate } from '@/components/templates/app/VersionTemplate';

interface Props {
  version: string;
}

export const VersionPage: FC<Props> = ({ version }) => <VersionTemplate version={version} />;
