export default async function handler(req,res) {
  if (req.method !== "GET") return res.status(405).json({error:"Method not allowed"});
  const key=process.env.LINK_URL_APIKEY;
  const uuid=String(req.query?.id || "");
  if (!key) return res.status(503).json({error:"Link scanning is not configured."});
  if (!/^[a-f0-9-]{20,50}$/i.test(uuid)) return res.status(400).json({error:"Invalid scan identifier."});
  try {
    const upstream=await fetch(`https://urlscan.io/api/v1/result/${encodeURIComponent(uuid)}/`,{headers:{"API-Key":key},signal:AbortSignal.timeout(10000)});
    if (upstream.status===404) return res.status(202).json({pending:true});
    if (upstream.status===410) return res.status(410).json({error:"This scan result is no longer available."});
    const data=await upstream.json().catch(()=>({}));
    if (!upstream.ok) return res.status(502).json({error:`URLScan result request failed (${upstream.status}).`});
    const engines=data.verdicts?.engines?.engines || [];
    const flagged=engines.filter(x=>x.malicious===true);
    const ml=Number(data.verdicts?.urlscan?.score ?? 0);
    const maliciousRequests=Number(data.stats?.malicious ?? 0);
    const community=Number(data.verdicts?.community?.score ?? 0);
    const hasVerdicts=Boolean(data.verdicts?.urlscan?.hasVerdicts);
    const findings=[];
    if (ml>0) findings.push(`URLScan machine-learning score: ${ml} (suspicious).`);
    if (flagged.length) findings.push(`${flagged.length} antivirus engine(s) flagged the page.`);
    for (const e of flagged.slice(0,8)) findings.push(`${e.enginename || e.name || "Security engine"}: ${e.result || "flagged"}`);
    if (maliciousRequests>0) findings.push(`${maliciousRequests} malicious network request(s) were observed.`);
    if (community<0) findings.push("Community reputation is negative.");
    if (!hasVerdicts && engines.length===0 && community===0 && maliciousRequests===0) findings.push("No reputation verdicts were available. This is unknown, not proof of safety.");
    const suspicious=ml>0 || flagged.length>0 || maliciousRequests>0 || community<0;
    const uncertain=!hasVerdicts && engines.length===0 && community===0 && maliciousRequests===0;
    return res.status(200).json({pending:false,uuid,verdict:suspicious?"Suspicious":uncertain?"Insufficient data":"No known malicious indicators detected",level:suspicious?"high":uncertain?"review":"low",findings,stats:{maliciousEngines:flagged.length,totalEngines:engines.length,maliciousRequests,securePercentage:data.stats?.securePercentage ?? null,requests:data.stats?.requests ?? null,uniqueDomains:data.stats?.uniqDomains ?? null},page:{url:data.page?.url || null,title:data.page?.title || null,ip:data.page?.ip || null,country:data.page?.country || null,status:data.page?.status || null},reportUrl:`https://urlscan.io/result/${uuid}/`,caveat:"A clean scan cannot guarantee that a site is safe. URLScan submissions are public."});
  } catch(error) { return res.status(502).json({error:error.name==="TimeoutError"?"Scan result request timed out.":"Could not retrieve the URLScan result."}); }
}
