import type { FC } from 'react';

import { AspectRatioSelect } from './AspectRatioSelect';
import { FileNameInput } from './FileNameInput';
import { FontSelect } from './FontSelect';
import type { FontName } from './FontSelect';
import { ShipInput } from './ShipInput';

export const Toolbar: FC<{
  ratio: string;
  onRatioChange: (v: string) => void;
  fontFamily: FontName;
  onFontChange: (v: FontName) => void;
  username: string;
  onUsernameChange: (v: string) => void;
  fileName: string;
  onFileNameChange: (v: string) => void;
}> = ({
  ratio,
  onRatioChange,
  fontFamily,
  onFontChange,
  username,
  onUsernameChange,
  fileName,
  onFileNameChange,
}) => (
  <div className='mb-6 flex items-start justify-center gap-6'>
    <AspectRatioSelect value={ratio} onChange={onRatioChange} />
    <FontSelect value={fontFamily} onChange={onFontChange} />
    <ShipInput value={username} onChange={onUsernameChange} />
    <FileNameInput value={fileName} onChange={onFileNameChange} />
  </div>
);

Toolbar.displayName = 'Toolbar';
