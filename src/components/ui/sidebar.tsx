import { cn } from "@/lib/utils/utils";
import { Button } from "./button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r", className)}>
      <div className="p-4">
        <h2 className="text-xl font-headline text-sidebar-foreground">Kumpulan Meeting</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">{/* Meeting list will be rendered here */}</div>
      </div>
      <div className="p-4 border-t">
        <Button className="w-full">New Meeting</Button>
      </div>
    </div>
  );
}
