import { FC } from 'react';

interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: (tag: string) => void;
}

export const TagBadge: FC<TagBadgeProps> = ({ tag, active, onClick }) => {
  if (onClick) {
    return (
      <button
        type='button'
        onClick={() => onClick(tag)}
        className={`badge badge-sm cursor-pointer transition-colors ${
          active
            ? 'badge-primary text-primary-content'
            : 'badge-ghost border-base-300 text-base-content/60 hover:text-base-content'
        }`}>
        {tag}
      </button>
    );
  }

  return (
    <span
      className={`badge badge-sm ${
        active
          ? 'badge-primary text-primary-content'
          : 'badge-ghost border-base-300 text-base-content/60'
      }`}>
      {tag}
    </span>
  );
};

TagBadge.displayName = 'TagBadge';
