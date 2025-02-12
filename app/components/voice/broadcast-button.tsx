import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useTranslations } from "~/hooks/translations-context"

interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => void
}

export function BroadcastButton({ isSessionActive, onClick }: BroadcastButtonProps) {
  const { t } = useTranslations();
  return (
    <Button
      variant={isSessionActive ? "destructive" : "accent"}
      className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2 motion-preset-shake"
      onClick={onClick}
    >
      {isSessionActive && (
        <Badge variant="secondary" className="animate-pulse bg-error-100 text-error-700">
          {t('broadcast.live')}
        </Badge>
      )}
      {isSessionActive ? t('broadcast.end') : t('broadcast.start')}
    </Button>
  )
} 