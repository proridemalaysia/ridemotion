import { Loader2 } from "lucide-react";

export const Spinner = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Loader2 className={`animate-spin ${className}`} size={size} />
);