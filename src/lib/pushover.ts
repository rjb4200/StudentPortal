type PushoverPriority = -2 | -1 | 0 | 1 | 2;

interface PushoverOptions {
  priority?: PushoverPriority;
  retry?: number;
  expire?: number;
}

export async function sendPushoverAlert(
  title: string,
  message: string,
  options: PushoverOptions = {}
) {
  if (!process.env.PUSHOVER_APP_TOKEN || !process.env.PUSHOVER_USER_KEY) {
    console.warn('Pushover not configured — skipping alert');
    return;
  }

  const { priority = 0, retry, expire } = options;

  const body: Record<string, unknown> = {
    token: process.env.PUSHOVER_APP_TOKEN,
    user: process.env.PUSHOVER_USER_KEY,
    title,
    message,
    priority,
  };

  if (priority === 2) {
    body.retry = retry ?? 30;
    body.expire = expire ?? 3600;
  }

  await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
