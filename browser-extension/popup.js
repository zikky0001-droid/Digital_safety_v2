const reviewButton = document.getElementById('review');
const statusNode = document.getElementById('status');
const resultsNode = document.getElementById('results');

function classifyUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { return ['This address could not be parsed.']; }
  const host = url.hostname.toLowerCase();
  const signals = [];
  if (url.protocol !== 'https:') signals.push('Uses HTTP instead of HTTPS. This is not proof of fraud, but the connection may not be encrypted.');
  if (url.username || url.password) signals.push('Contains credentials inside the URL, which can be deceptive.');
  if (host.startsWith('xn--') || host.split('.').some(part => part.startsWith('xn--'))) signals.push('Uses a punycode domain label. Verify the spelling carefully.');
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) signals.push('Uses a raw IPv4 address instead of a typical registered domain.');
  if (host.split('.').length >= 5) signals.push('Contains many subdomain levels. Verify the actual registered domain.');
  if (/(login|verify|signin|secure|wallet|claim|gift|bonus|airdrop|password|account)/i.test(host) && host.split('.').length > 2) signals.push('Contains account/security or prize-related wording in the host. Check independently.');
  if (/(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly)$/i.test(host)) signals.push('Uses a link-shortening service, so the final destination is not obvious.');
  return signals;
}

reviewButton.addEventListener('click', async () => {
  reviewButton.disabled = true;
  statusNode.textContent = 'Reviewing the current tab locally…';
  resultsNode.hidden = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !/^https?:/i.test(tab.url)) {
      throw new Error('This browser page does not allow extension analysis. Open a regular HTTP or HTTPS website and try again.');
    }
    const injected = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 200).map((a) => {
          const anchor = a;
          const raw = anchor.href;
          let host = '';
          try { host = new URL(raw).hostname; } catch {}
          const text = (anchor.innerText || anchor.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 100);
          let mismatch = false;
          const visibleUrl = text.match(/^(?:https?:\/\/)?([^\s/]+)/i);
          if (visibleUrl && /\./.test(visibleUrl[1])) {
            const shown = visibleUrl[1].replace(/^www\./i, '').toLowerCase();
            const target = host.replace(/^www\./i, '').toLowerCase();
            mismatch = shown !== target && !target.endsWith(`.${shown}`);
          }
          return { text, href: raw, host, mismatch };
        });
        return { page: location.href, title: document.title, links };
      }
    });
    const data = injected?.[0]?.result;
    if (!data) throw new Error('Could not read this page. Try a normal website.');
    const pageSignals = classifyUrl(data.page);
    const suspiciousLinks = data.links.map((link) => {
      const flags = classifyUrl(link.href);
      if (link.mismatch) flags.push('Visible link text appears to name a different host from the actual destination.');
      return { ...link, flags };
    }).filter((link) => link.flags.length).slice(0, 12);
    const allSignals = [...pageSignals];
    if (suspiciousLinks.length) allSignals.push(`${suspiciousLinks.length} visible link(s) had one or more heuristic warning signs.`);
    const level = pageSignals.some(s => /credentials inside|raw IPv4|could not be parsed/i.test(s)) || pageSignals.length >= 3 || suspiciousLinks.some(l => l.flags.some(s => /credentials inside|Visible link text/i.test(s))) ? 'high' : allSignals.length ? 'review' : 'low';
    document.getElementById('risk').className = `risk ${level}`;
    document.getElementById('risk').textContent = level === 'high' ? 'STRONG CAUTION' : level === 'review' ? 'REVIEW' : 'NO OBVIOUS FLAGS';
    document.getElementById('title').textContent = level === 'high' ? 'Several strong warning signs' : level === 'review' ? 'A few things deserve a closer look' : 'No obvious heuristic warning signs';
    document.getElementById('page').textContent = `${data.title || 'Untitled page'} · ${data.page}`;
    const signalsNode = document.getElementById('signals');
    signalsNode.replaceChildren();
    for (const signal of (allSignals.length ? allSignals : ['No listed heuristic warning signs were detected on the page URL. This is not a reputation check and cannot verify safety.'])) {
      const el = document.createElement('div'); el.className = 'signal'; el.textContent = signal; signalsNode.appendChild(el);
    }
    const linksNode = document.getElementById('links');
    linksNode.replaceChildren();
    if (!suspiciousLinks.length) {
      const el = document.createElement('p'); el.className = 'muted'; el.textContent = 'No visible links matched the simple warning rules. Only the first 200 links were checked.'; linksNode.appendChild(el);
    } else {
      for (const link of suspiciousLinks) {
        const el = document.createElement('div'); el.className = 'link-item';
        const label = document.createElement('strong'); label.textContent = link.text || '(link with no visible text)';
        const href = document.createElement('code'); href.textContent = link.href;
        const reason = document.createElement('p'); reason.textContent = link.flags.join(' ');
        el.append(label, href, reason); linksNode.appendChild(el);
      }
    }
    resultsNode.hidden = false;
    statusNode.textContent = 'Review finished. Page URLs and visible link data were processed locally and not sent to a server.';
  } catch (error) {
    statusNode.textContent = error instanceof Error ? error.message : 'Unable to review this tab.';
  } finally { reviewButton.disabled = false; }
});
