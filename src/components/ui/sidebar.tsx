import {cn} from '@/lib/utils';
import {Button} from './button';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({className}: SidebarProps) {
  return (
    <div className={cn('flex flex-col h-full bg-sidebar border-r', className)}>
      <div className="p-4">
        <h2 className="text-xl font-headline text-sidebar-foreground">Recordings</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-primary-foreground bg-sidebar-primary"
          >
            Team Sync - 03/04/24
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            UX Feedback - 02/28/24
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Marketing Standup - 02/26/24
          </Button>
        </div>
      </div>
      <div className="p-4 border-t">
        <Button className="w-full">New Recording</Button>
      </div>
    </div>
  );
}
