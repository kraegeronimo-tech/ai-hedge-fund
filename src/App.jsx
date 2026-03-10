import { useState } from 'react';
import { FundProvider, useFund } from './context/FundContext';
import { Shell } from './components/layout/Shell';
import { FundOverview } from './components/overview/FundOverview';
import { AgentCard } from './components/agents/AgentCard';
import { AgentDetail } from './components/agents/AgentDetail';
import { TradeFeed } from './components/trades/TradeFeed';
import { MarketGrid } from './components/market/MarketGrid';
import { VIEWS, AGENTS } from './lib/constants';

function AgentsView() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  if (selectedAgent) {
    return <AgentDetail agentId={selectedAgent} onBack={() => setSelectedAgent(null)} />;
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">AI Agents</h2>
        <div className="text-xs font-mono text-navy-400">4 AGENTS · 2+ VOTES TO EXECUTE</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 fade-in-stagger">
        {Object.keys(AGENTS).map(id => (
          <AgentCard key={id} agentId={id} onSelect={setSelectedAgent} />
        ))}
      </div>
    </div>
  );
}

function ViewRouter({ view }) {
  switch (view) {
    case VIEWS.OVERVIEW: return <FundOverview />;
    case VIEWS.AGENTS: return <AgentsView />;
    case VIEWS.TRADES: return <TradeFeed />;
    case VIEWS.MARKET: return <MarketGrid />;
    default: return <FundOverview />;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState(VIEWS.OVERVIEW);

  return (
    <FundProvider>
      <Shell activeView={activeView} onViewChange={setActiveView}>
        <ViewRouter view={activeView} />
      </Shell>
    </FundProvider>
  );
}
