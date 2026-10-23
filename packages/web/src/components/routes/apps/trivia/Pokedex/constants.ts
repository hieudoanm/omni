export const TYPE_COLORS: Record<string, string> = {
  fire: 'badge-error',
  water: 'badge-info',
  grass: 'badge-success',
  electric: 'badge-warning',
  rock: 'badge-neutral',
  ground: 'badge-neutral',
  psychic: 'badge-secondary',
  ice: 'badge-info',
  dragon: 'badge-primary',
  dark: 'badge-neutral',
  fairy: 'badge-secondary',
  normal: 'badge-ghost',
  fighting: 'badge-error',
  poison: 'badge-secondary',
  bug: 'badge-success',
  ghost: 'badge-neutral',
  steel: 'badge-ghost',
  flying: 'badge-info',
};

export const getTypeColor = (type: string) => TYPE_COLORS[type] ?? 'badge-ghost';
