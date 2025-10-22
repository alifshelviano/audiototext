import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

export function Header() {
  return (
    <header className="p-4 border-b flex justify-between items-center">
      <div>
        <h1 className="font-headline text-2xl">LISN</h1>
      </div>
      <Avatar>
        <AvatarImage src="/images/person-1.jpg" alt="Person 1" />
        <AvatarFallback>P1</AvatarFallback>
      </Avatar>
    </header>
  );
}
