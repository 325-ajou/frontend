import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          error: '[&_[data-icon]]:text-red-500',
          success: '[&_[data-icon]]:text-green-500',
          warning: '[&_[data-icon]]:text-amber-500',
          info: '[&_[data-icon]]:text-blue-500',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
