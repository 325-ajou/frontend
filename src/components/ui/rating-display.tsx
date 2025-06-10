import { cn } from '@/lib/utils';

interface RatingOption {
  value: number;
  label: string;
  emoji: string;
  description: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: 1, label: '화나요', emoji: '😡', description: '매우 불만족' },
  { value: 2, label: '쏘쏘', emoji: '🤔', description: '아쉬움' },
  { value: 3, label: '괜찮아요', emoji: '👍', description: '보통' },
  { value: 4, label: '추천', emoji: '👍👍', description: '만족' },
  { value: 5, label: '꼭 가세요', emoji: '👍👍👍', description: '매우 만족' },
];

interface RatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RatingDisplay({ rating, size = 'md', showLabel = true, className }: RatingDisplayProps) {
  const ratingOption = RATING_OPTIONS.find((option) => option.value === rating);

  if (!ratingOption) {
    return null;
  }

  const sizeClasses = {
    sm: {
      emoji: 'text-sm',
      label: 'text-xs',
      container: 'gap-1 px-2 py-1',
    },
    md: {
      emoji: 'text-base',
      label: 'text-sm',
      container: 'gap-1.5 px-2.5 py-1.5',
    },
    lg: {
      emoji: 'text-lg',
      label: 'text-base',
      container: 'gap-2 px-3 py-2 rounded-md',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-baseline rounded-full bg-gray-50 border border-gray-200 whitespace-nowrap',
        sizeClasses[size].container,
        className
      )}
      title={ratingOption.description}
    >
      <span className={cn(sizeClasses[size].emoji)}>{ratingOption.emoji}</span>
      {showLabel && (
        <span className={cn('font-medium text-gray-700', sizeClasses[size].label)}>{ratingOption.label}</span>
      )}
    </div>
  );
}
