import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenLoaderProps {
  message?: string;
  className?: string;
}

export function FullscreenLoader({
  message = 'Carregando...'
  , className,
}: FullscreenLoaderProps) {
  return (
    <div className={cn('flex h-screen w-full flex-col items-center justify-center gap-3 bg-background', className)}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
