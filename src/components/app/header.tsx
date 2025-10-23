import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export function Header() {
  return (
    <header className="p-4 border-b flex justify-between items-center">
      <div>
        <h1 className="font-headline text-2xl">LISN</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline">Logout</Button>
        </Link>
        <Avatar>
          <AvatarImage src="/images/person-1.jpg" alt="Person 1" />
          <AvatarFallback>P1</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
