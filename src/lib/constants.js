export const AGENTS = {
  apex: {
    id: 'apex',
    name: 'APEX',
    strategy: 'Momentum / Trend-Following',
    description: 'Chases winners, cuts losers fast. Prefers volatile coins with strong upward momentum.',
    personality: 'Brash, confident, punchy sentences. Sports metaphors.',
    risk: 'High',
    color: '#F59E0B',
    colorClass: 'agent-apex',
    avatar: '⚡',
  },
  oracle: {
    id: 'oracle',
    name: 'ORACLE',
    strategy: 'Value / Fundamentals',
    description: 'Buys dips in high-cap coins. Patient, long-term holder. Waits for value.',
    personality: 'Measured, academic, financial jargon. Speaks in paragraphs.',
    risk: 'Low',
    color: '#3B82F6',
    colorClass: 'agent-oracle',
    avatar: '🔮',
  },
  shadow: {
    id: 'shadow',
    name: 'SHADOW',
    strategy: 'Contrarian',
    description: 'Buys biggest losers, sells overhyped winners. Fades the crowd.',
    personality: 'Sardonic, skeptical, dark humor. Enjoys being right when others are wrong.',
    risk: 'Medium',
    color: '#A855F7',
    colorClass: 'agent-shadow',
    avatar: '👁',
  },
  cipher: {
    id: 'cipher',
    name: 'CIPHER',
    strategy: 'Quantitative / Technical',
    description: 'RSI proxies, volume patterns, MA crosses. Pure data-driven decisions.',
    personality: 'Robotic, clinical, speaks in data points and numbers.',
    risk: 'Medium',
    color: '#06B6D4',
    colorClass: 'agent-cipher',
    avatar: '◈',
  },
};

export const AGENT_IDS = Object.keys(AGENTS);

export const INITIAL_FUND = 100000;
export const MAX_POSITIONS = 8;
export const VOTES_REQUIRED = 2;

export const VIEWS = {
  OVERVIEW: 'overview',
  AGENTS: 'agents',
  TRADES: 'trades',
  LEADERBOARD: 'leaderboard',
  MARKET: 'market',
};

export const ACTION_COLORS = {
  BUY: 'text-profit',
  SELL: 'text-loss',
  HOLD: 'text-navy-400',
};

export const POLL_INTERVALS = {
  PORTFOLIO: 60_000,
  MARKET: 120_000,
  STATUS: 30_000,
};
