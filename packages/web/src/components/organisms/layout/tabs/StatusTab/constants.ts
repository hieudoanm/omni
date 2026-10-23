export const STATUS_SERVICES: Record<string, Record<string, string>> = {
  atlassian: {
    analytics: 'https://analytics.status.atlassian.com/api/v2/status.json',
    atlas: 'https://atlas.status.atlassian.com/api/v2/status.json',
    compass: 'https://compass.status.atlassian.com/api/v2/status.json',
    confluence: 'https://confluence.status.atlassian.com/api/v2/status.json',
    developer: 'https://developer.status.atlassian.com/api/v2/status.json',
    'jira-service-management':
      'https://jira-service-management.status.atlassian.com/api/v2/status.json',
    'jira-software': 'https://jira-software.status.atlassian.com/api/v2/status.json',
    guard: 'https://guard.status.atlassian.com/api/v2/status.json',
    opsgenie: 'https://opsgenie.status.atlassian.com/api/v2/status.json',
    partners: 'https://partners.status.atlassian.com/api/v2/status.json',
    support: 'https://support.status.atlassian.com/api/v2/status.json',
    trello: 'https://trello.status.atlassian.com/api/v2/status.json',
  },
  'server(less)': {
    supabase: 'https://status.supabase.com/api/v2/status.json',
    render: 'https://status.render.com/api/v2/status.json',
    flyio: 'https://status.flyio.net/api/v2/status.json',
    cloudflare: 'https://www.cloudflarestatus.com/api/v2/status.json',
    netlify: 'https://www.netlifystatus.com/api/v2/status.json',
    vercel: 'https://www.vercel-status.com/api/v2/status.json',
  },
  crypto: {
    hedera: 'https://status.hedera.com/api/v2/status.json',
    solana: 'https://status.solana.com/api/v2/status.json',
    polygon: 'https://status.polygon.technology/api/v2/status.json',
  },
  'version control': {
    bitbucket: 'https://bitbucket.status.atlassian.com/api/v2/status.json',
    github: 'https://www.githubstatus.com/api/v2/status.json',
    npm: 'https://status.npmjs.org/api/v2/status.json',
  },
};

export const totalCount = Object.values(STATUS_SERVICES).reduce(
  (acc, s) => acc + Object.keys(s).length,
  0,
);
