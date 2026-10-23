import { FC } from 'react';

interface Photo {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface PhotosGridProps {
  photos: Photo[];
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  aspectRatio?: string;
  className?: string;
  onPhotoClick?: (photo: Photo) => void;
}

const colsMap: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'sm:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'lg:grid-cols-4',
  '5': 'xl:grid-cols-5',
  '6': '2xl:grid-cols-6',
};

export const PhotosGrid: FC<PhotosGridProps> = ({
  photos,
  columns = { sm: 2, md: 3, lg: 4 },
  gap = 'gap-4',
  aspectRatio = 'aspect-[4/3]',
  className = '',
  onPhotoClick,
}) => {
  const gridCols = [
    columns.xl && colsMap[String(columns.xl)],
    columns.lg && colsMap[String(columns.lg)],
    columns.md && colsMap[String(columns.md)],
    columns.sm && colsMap[String(columns.sm)],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`grid ${gridCols || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} ${gap} ${className}`}>
      {photos.map((photo) => (
        <button
          key={photo.id}
          type='button'
          onClick={() => onPhotoClick?.(photo)}
          className={`group relative w-full overflow-hidden rounded-xl ${onPhotoClick ? 'cursor-pointer' : 'cursor-default'}`}>
          <div className={`${aspectRatio} w-full`}>
            <img
              src={photo.src}
              alt={photo.alt}
              loading='lazy'
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </div>
          {photo.caption && (
            <div className='absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-3 transition-transform duration-300 group-hover:translate-y-0'>
              <p className='text-sm text-white'>{photo.caption}</p>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
PhotosGrid.displayName = 'PhotosGrid';
