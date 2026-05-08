import { Mail, MessageSquare, Send, Users } from 'lucide-react'

export default function IntegrationsPage() {
  const integrations = [
    {
      title: 'Email (SMTP)',
      description: 'Send alert notifications via email',
      icon: Mail,
      env: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'],
    },
    {
      title: 'Slack',
      description: 'Send alerts to a Slack channel',
      icon: MessageSquare,
      env: ['SLACK_WEBHOOK_URL'],
    },
    {
      title: 'Microsoft Teams',
      description: 'Send alerts to a Teams channel',
      icon: Users,
      env: ['TEAMS_WEBHOOK_URL'],
    },
    {
      title: 'Telegram',
      description: 'Send alerts via Telegram bot',
      icon: Send,
      env: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Integrations</h1>
        <p className="mt-1 text-sm text-text-secondary">Connect external notification services</p>
      </div>

      <div className="rounded-[4px] border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
        Integrations are configured via environment variables on the server. Restart the backend container after changes.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <article key={integration.title} className="space-y-3 rounded-[4px] border border-bg-border bg-bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">
                  <Icon className="size-4 text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">{integration.title}</h2>
                  <p className="mt-1 text-xs text-text-secondary">{integration.description}</p>
                </div>
              </div>
              <div className="rounded-[4px] border border-bg-border bg-bg-base p-3">
                <code className="block whitespace-pre-wrap text-xs text-text-primary">
                  {integration.env.join('\n')}
                </code>
              </div>
            </article>
          )
        })}
      </div>

      <a href="#" className="inline-block text-sm text-accent underline-offset-2 hover:underline">
        View documentation
      </a>
    </div>
  )
}
