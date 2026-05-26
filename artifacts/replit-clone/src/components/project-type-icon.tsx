import { Globe, Smartphone, Gamepad2, Layers, PresentationIcon, BarChart2, Zap, FileText, Table2 } from "lucide-react";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  mobile: Smartphone,
  game: Gamepad2,
  design: Layers,
  slides: PresentationIcon,
  "data-viz": BarChart2,
  animation: Zap,
  document: FileText,
  spreadsheet: Table2,
};

export default function ProjectTypeIcon({ type, className }: { type: string; className?: string }) {
  const Icon = TYPE_ICONS[type] ?? Globe;
  return <Icon className={className} />;
}
