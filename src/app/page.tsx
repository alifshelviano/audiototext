import {Header} from '@/components/app/header';
import {MeetingForm} from '@/components/app/meeting-form';

export default function Page() {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <MeetingForm />
        </div>
      </div>
    </main>
  );
}
