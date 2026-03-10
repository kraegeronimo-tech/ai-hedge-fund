import { Ticker } from './Ticker';
import { Sidebar } from './Sidebar';

export function Shell({ activeView, onViewChange, children }) {
  return (
    <div className="h-screen flex flex-col bg-navy-950">
      <Ticker />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={onViewChange} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
