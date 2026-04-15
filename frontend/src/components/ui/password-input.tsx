import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  containerClassName?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, containerClassName, disabled, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const autoId = React.useId();
    const inputId = id ?? autoId;

    return (
      <div className={cn('relative', disabled && 'opacity-60', containerClassName)}>
        <Input
          id={inputId}
          ref={ref}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn('pr-10 transition-[color,box-shadow] duration-150', className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          tabIndex={-1}
          className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-controls={inputId}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
        >
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Eye
              className={cn(
                'absolute h-4 w-4 transition-all duration-200 ease-out',
                visible ? 'scale-90 opacity-0' : 'scale-100 opacity-100',
              )}
              aria-hidden
            />
            <EyeOff
              className={cn(
                'absolute h-4 w-4 transition-all duration-200 ease-out',
                visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
              )}
              aria-hidden
            />
          </span>
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
