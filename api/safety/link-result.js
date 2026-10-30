function countOrList(value, list) {
  const n = Number(value || 0);
  return n || (Array.isArray(list) ? list.length : 0);
}
function safeArray(value) { return Array.isArray(value) ? value : []; }

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.LINK_URL_APIKEY;
  const uuid = String(req.query?.id || "");
  if (!key) return res.status(503).json({ error: "Link scanning is not configured." });
  if (!/^[a-f0-9-]{20,50}$/i.test(uuid)) return res.status(400).json({ error: "Invalid scan identifier." });

  try {
    const upstream = await fetch(`https://urlscan.io/api/v1/result/${encodeURIComponent(uuid)}/`, {
      headers: { "API-Key": key },
      signal: AbortSignal.timeout(10000)
    });
    if (upstream.status === 404) return res.status(202).json({ pending: true });
    if (upstream.status === 410) return res.status(410).json({ error: "This scan result is no longer available." });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return res.status(502).json({ error: `Scan result request failed (${upstream.status}).` });

    const verdicts = data.verdicts || {};
    const engines = safeArray(verdicts.engines?.engines);
    const flagged = engines.filter(engine => engine?.malicious === true);
    const ml = Number(verdicts.urlscan?.score ?? 0);
    const hasVerdicts = Boolean(verdicts.urlscan?.hasVerdicts);
    const community = Number(verdicts.community?.score ?? 0);
    const maliciousRequests = Number(data.stats?.malicious ?? 0);
    const securePercentage = Number(data.stats?.securePercentage ?? 100);
    const umbrellaRank = Number(data.page?.umbrellaRank ?? 0);
    const requestCount = countOrList(data.stats?.requests, data.data?.requests);
    const uniqueIPs = countOrList(data.stats?.uniqIPs, data.lists?.ips);
    const uniqueDomains = countOrList(data.stats?.uniqDomains, data.lists?.domains);
    const uniqueCountries = countOrList(data.stats?.uniqCountries, data.lists?.countries);

    // Preserve the supplied composite formula so the report matches the Termux output.
    const goodSignals = [
      ml < 0,
      ml === 0 && hasVerdicts === false,
      flagged.length === 0,
      community >= 0,
      maliciousRequests === 0,
      securePercentage === 100,
      umbrellaRank > 0
    ].filter(Boolean).length;
    const badSignals = [
      ml > 0,
      flagged.length > 0,
      community < 0,
      securePercentage < 100
    ].filter(Boolean).length + (maliciousRequests > 0 ? 2 : 0);
    const totalSignals = goodSignals + badSignals;
    const safetyScore = totalSignals === 0 ? 50 : Math.floor((goodSignals / totalSignals) * 100);
    const riskLevel = safetyScore >= 85 ? "SAFE"
      : safetyScore >= 70 ? "LOW RISK"
      : safetyScore >= 45 ? "MODERATE RISK"
      : safetyScore >= 21 ? "HIGH RISK" : "DANGEROUS";
    const level = safetyScore >= 70 ? "low" : safetyScore >= 45 ? "review" : "high";

    const page = data.page || {};
    const stats = data.stats || {};
    const lists = data.lists || {};
    const serverStats = safeArray(stats.serverStats);
    const findings = [];
    findings.push(`URLScan ML: ${ml} (${ml > 0 ? "malicious indicator" : ml < 0 ? "benign verdict" : `no verdict; hasVerdicts=${hasVerdicts}`}).`);
    findings.push(`Antivirus engines: ${flagged.length} flagged of ${engines.length} available.`);
    for (const engine of flagged) findings.push(`${engine.enginename || engine.name || "Security engine"}: ${engine.result || "flagged"}`);
    findings.push(`Community score: ${community} (${community < 0 ? "negative" : community > 0 ? "positive" : "no votes"}).`);
    findings.push(`Malicious requests: ${maliciousRequests}.`);
    findings.push(`Secure percentage: ${securePercentage}%.`);
    findings.push(`Umbrella rank: ${umbrellaRank > 0 ? umbrellaRank : "not ranked"}.`);

    return res.status(200).json({
      pending: false,
      uuid,
      verdict: riskLevel,
      level,
      composite: { safetyScore, riskLevel, goodSignals, badSignals, totalSignals },
      findings,
      page: {
        url: page.url ?? null,
        title: page.title ?? null,
        ip: page.ip ?? null,
        country: page.country ?? null,
        asn: page.asn ?? null,
        asnname: page.asnname ?? null,
        server: page.server ?? null,
        status: page.status ?? null,
        mimeType: page.mimeType ?? null,
        tlsIssuer: page.tlsIssuer ?? null,
        tlsAgeDays: page.tlsAgeDays ?? null,
        umbrellaRank: page.umbrellaRank ?? null
      },
      stats: {
        requests: requestCount,
        uniqueIPs,
        uniqueDomains,
        uniqueCountries,
        dataLength: Number(stats.dataLength ?? 0),
        dataSizeMB: Math.round((Number(stats.dataLength ?? 0) / 1048576) * 100) / 100,
        totalLinks: Number(stats.totalLinks ?? 0),
        malicious: maliciousRequests,
        securePercentage,
        serverStats
      },
      verdictDetails: {
        urlscan: verdicts.urlscan ?? null,
        engines: { total: engines.length, flagged: flagged.length, results: engines },
        community: verdicts.community ?? null
      },
      network: {
        ips: safeArray(lists.ips),
        domains: safeArray(lists.domains),
        countries: safeArray(lists.countries),
        requests: safeArray(data.data?.requests)
      },
      reportUrl: `https://urlscan.io/result/${uuid}/`,
      assessment: safetyScore >= 85
        ? "The available indicators are broadly reassuring. This is not a guarantee; verify the site before sharing sensitive information."
        : safetyScore >= 70
          ? "The available indicators suggest relatively low risk, but some checks may be incomplete. Do not treat this score as proof that the site is safe."
          : safetyScore >= 45
            ? "The scan contains mixed or incomplete signals. Be cautious and independently verify the website before interacting with it."
            : "The available indicators raise significant concerns. Avoid entering passwords, payment details, or verification codes unless you independently verify the site.",
      caveat: "The composite score is an indicative heuristic based on available scan fields. Missing verdicts and unavailable engines are not proof of safety."
    });
  } catch (error) {
    return res.status(502).json({
      error: error.name === "TimeoutError" ? "Scan result request timed out." : "Could not retrieve the scan result."
    });
  }
}
