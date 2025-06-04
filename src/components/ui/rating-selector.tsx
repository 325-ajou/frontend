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

interface RatingGuidelineProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  className?: string;
}

export function RatingSelector({ rating, onRatingChange, readonly = false, className }: RatingGuidelineProps) {
  const handleRatingClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2 flex-wrap">
        {RATING_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleRatingClick(option.value)}
            disabled={readonly}
            className={cn(
              'flex flex-row items-center gap-1 px-2 py-1 rounded-lg border-2 transition-all duration-200',
              'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              rating === option.value
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300',
              !readonly && 'cursor-pointer',
              readonly && 'cursor-default opacity-70'
            )}
            title={option.description}
          >
            <span className="text-lg">{option.emoji}</span>
            <span className="text-sm font-medium text-gray-700 text-center leading-tight">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
