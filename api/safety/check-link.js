const MAX_URL_LENGTH = 2048;
function send(res, status, body) { res.status(status).json(body); }
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res,405,{error:"Method not allowed"});
  const endpoint = process.env.LINK_URL;
  const key = process.env.LINK_URL_APIKEY;
  if (!endpoint || !key) return send(res,503,{error:"Link scanning is not configured."});
  const { url, publicScanConsent } = req.body || {};
  if (typeof url !== "string" || url.length > MAX_URL_LENGTH) return send(res,400,{error:"Provide a valid URL under 2,048 characters."});
  let parsed;
  try { parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`); }
  catch { return send(res,400,{error:"That website address is not valid."}); }
  if (!["http:","https:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password)
    return send(res,400,{error:"Only ordinary HTTP or HTTPS website URLs are supported."});
  if (publicScanConsent !== true) return send(res,400,{error:"Confirm that you understand URLScan submissions may be publicly visible."});
  try {
    const upstream = await fetch(endpoint,{method:"POST",headers:{"API-Key":key,"Content-Type":"application/json"},body:JSON.stringify({url:parsed.href,visibility:"public"}),signal:AbortSignal.timeout(12000)});
    const data = await upstream.json().catch(()=>({}));
    if (!upstream.ok || !data.uuid) return send(res,502,{error:data.message || data.description || `URLScan submission failed (${upstream.status}).`});
    return send(res,202,{uuid:data.uuid,resultPath:`/api/safety/link-result?id=${encodeURIComponent(data.uuid)}`,visibility:"public"});
  } catch (error) { return send(res,502,{error:error.name==="TimeoutError"?"URLScan submission timed out. Try again.":"Could not reach URLScan."}); }
}
