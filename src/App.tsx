import { useEffect, useMemo, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Activity, AlertCircle, ArrowRight, Bell, BookOpen, Bookmark, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Code2, Copy, Download, ExternalLink, FileText, Gauge, Globe, Info, Laptop, Link2, LoaderCircle, LockKeyhole, MapPin, Menu, Monitor, Moon, Package, PauseCircle, PlayCircle, RefreshCw, RotateCcw, Search, Shield, ShieldAlert, ShieldCheck, Smartphone, Sun, Trash2, Sparkles, TriangleAlert, UserPlus, X, Zap } from 'lucide-react';

type Lesson = { title: string; category: string; difficulty: string; summary: string; works: string; signs: string[]; example: string; prevent: string[]; response: string };
const lessons: Lesson[] = [
  { title:'Phishing emails & fake login pages',category:'Messages',difficulty:'Foundational',summary:'A deceptive message tries to persuade you to reveal information or visit a page controlled by someone else.',works:'The sender imitates a familiar service and adds a link or attachment. A convincing-looking page may copy a brand, but the address and request deserve a closer look.',signs:['Unexpected urgency or a threatened account closure','A sender address that does not match the organization','A link destination that differs from the visible text'],example:'TRAINING EXAMPLE: A fictional “Mailbox Team” asks you to review an account at example.com before the end of the day.',prevent:['Open the service using a saved bookmark or typed address','Check the full sender and destination before acting','Use MFA and a unique password for each account'],response:'Do not reply or follow the link. If you entered a password, change it through the official site from a trusted device and review active sessions.'},
  { title:'Smishing: fraudulent texts',category:'Messages',difficulty:'Foundational',summary:'Smishing is phishing delivered through SMS or messaging apps.',works:'A short message may impersonate a delivery service, bank, or person you know, and direct you to a link or ask for a quick reply.',signs:['Unexpected parcel or payment problem','Shortened or unfamiliar link','Requests for a code, payment, or personal details'],example:'TRAINING EXAMPLE: “Delivery paused. Confirm a small fee at example.com/parcel.”',prevent:['Verify through the company’s official app or website','Do not use links in unexpected texts','Keep one-time codes private'],response:'Avoid replying. Report or block the sender using your messaging app and contact the service independently if needed.'},
  { title:'Vishing: fraudulent calls',category:'Messages',difficulty:'Foundational',summary:'Vishing uses voice calls to pressure someone into sharing information or taking an action.',works:'A caller may claim to represent support, a bank, or a government office. Caller ID can be misleading, so it is not proof of identity.',signs:['Pressure to act immediately or keep the call secret','Requests for passwords, one-time codes, or remote access','A caller discourages you from calling back independently'],example:'TRAINING EXAMPLE: A caller claiming to be “Account Support” asks you to read out a verification code.',prevent:['End the call and use a number from the official website or card','Never share a one-time code with an incoming caller','Ask a trusted person to help slow down a pressured decision'],response:'Hang up. Contact the organization through a trusted channel and report suspected fraud to the relevant service.'},
  { title:'Social engineering & impersonation',category:'Messages',difficulty:'Foundational',summary:'Social engineering manipulates trust, helpfulness, fear, or authority to influence a decision.',works:'A person or message may impersonate a colleague, relative, support agent, or authority and create urgency or secrecy.',signs:['An unusual request from a familiar name','A request to bypass normal checks','Pressure, secrecy, or an emotional appeal'],example:'TRAINING EXAMPLE: A fictional colleague asks for gift cards because they are “locked out” and cannot talk.',prevent:['Verify unusual requests using another known channel','Use a pre-agreed family or workplace verification phrase','Pause and involve someone you trust'],response:'Stop the conversation and verify independently. Report impersonation through the relevant platform.'},
  { title:'Malware & unsafe downloads',category:'Devices',difficulty:'Intermediate',summary:'Malware is software that can disrupt a device, access information, or perform unwanted actions.',works:'It may arrive through untrusted downloads, attachments, or deceptive prompts. A file name or icon alone cannot establish that a download is safe.',signs:['Unexpected installer or attachment','A download source unrelated to the software publisher','New, unexplained behavior after installing a file'],example:'TRAINING EXAMPLE: A page asks you to install a “video codec” from an unfamiliar download site.',prevent:['Download software from its publisher or trusted app store','Keep operating systems and apps updated','Avoid unexpected attachments and installers'],response:'Stop using the suspicious file. Seek help from trusted security software or a qualified professional if compromise is suspected.'},
  { title:'Ransomware & backup safety',category:'Devices',difficulty:'Intermediate',summary:'Ransomware can make files unavailable and demand payment; current, separate backups help with recovery.',works:'It may arrive through unsafe files or compromised accounts. Paying does not guarantee recovery and may invite further demands.',signs:['Files become unexpectedly inaccessible','An unfamiliar demand appears on the device','Unexpected file changes across folders'],example:'TRAINING EXAMPLE: A fictional note claims your files are locked and requests payment.',prevent:['Keep backups that are not always connected to the device','Test that important files can be restored','Update software and use unique account credentials'],response:'Disconnect affected devices from networks if safe to do so. Do not rush payment; seek qualified support and report the incident.'},
  { title:'Spyware & privacy-invasive apps',category:'Devices',difficulty:'Intermediate',summary:'Spyware or overly intrusive apps may collect more information than expected.',works:'An app can request permissions that are not needed for its advertised function. Permission access is not proof of malicious behavior, but it is worth reviewing.',signs:['Unclear publisher or privacy information','Permissions that do not fit the app’s purpose','Unexpected pop-ups or unexplained data use'],example:'TRAINING EXAMPLE: A simple wallpaper app requests access to contacts and microphone.',prevent:['Install apps from reputable sources','Review permissions and privacy settings periodically','Remove apps you no longer use'],response:'Revoke unnecessary permissions and uninstall an app you do not trust. Change affected account credentials if you suspect exposure.'},
  { title:'Fake updates & browser notifications',category:'Devices',difficulty:'Foundational',summary:'Deceptive pop-ups may imitate update notices or use notifications to promote misleading content.',works:'A page may claim that a browser or media player is out of date and prompt a download, or ask to send repeated notifications.',signs:['Update message appears on an unrelated website','A download is requested to view ordinary content','Notifications continue after leaving the page'],example:'TRAINING EXAMPLE: A fictional streaming page says “Update required” and offers a download from example.com.',prevent:['Update software through its own settings or official app store','Decline notification requests you did not expect','Review site notification permissions in browser settings'],response:'Close the page without downloading. Remove unwanted site permissions and use official update controls.'},
  { title:'Misleading browser extensions',category:'Devices',difficulty:'Intermediate',summary:'Extensions can access browsing data; choose them carefully and review their permissions.',works:'An extension may request broad access to websites or change browser behavior. Even useful extensions can change ownership or policies over time.',signs:['Unfamiliar publisher or unclear purpose','Permissions broader than the feature needs','A new tab or search behavior you did not choose'],example:'TRAINING EXAMPLE: A coupon extension asks to read data on every website despite only offering price reminders.',prevent:['Install only extensions you need from trusted stores','Review requested permissions and publisher details','Remove unused extensions and review them periodically'],response:'Disable or remove the extension, then review browser settings and account activity if you suspect data exposure.'},
  { title:'Account takeover & credential reuse',category:'Accounts',difficulty:'Intermediate',summary:'Account takeover occurs when another person gains access to an account, sometimes using reused or exposed passwords.',works:'Reusing a password lets a credential exposed on one service put other accounts at risk. Attackers may also use impersonation to request a code.',signs:['Unfamiliar sign-in alerts or sessions','Unexpected password reset messages','Changes you did not make to account settings'],example:'TRAINING EXAMPLE: A reused password from an unrelated fictional forum is tried on an email account.',prevent:['Use a unique password for each account','Enable MFA or passkeys where available','Keep recovery methods current and review sessions'],response:'Use the service’s official recovery process, change the password from a trusted device, end unfamiliar sessions, and contact support.'},
  { title:'Password security & password managers',category:'Accounts',difficulty:'Foundational',summary:'Long, unique passwords reduce the risk that one exposed password unlocks multiple accounts.',works:'A password manager can create and store unique credentials, reducing the need to reuse or memorize them all.',signs:['The same password appears across accounts','A password is short, predictable, or shared','A password arrives in a message asking you to confirm it'],example:'TRAINING EXAMPLE: One familiar password is reused for email, shopping, and a social account.',prevent:['Use a reputable password manager','Make each password unique and hard to guess','Protect your manager with a strong master password and MFA'],response:'Change reused passwords at the affected services, prioritizing email and financial accounts. NIST guidance below explains password choices.'},
  { title:'MFA & passkeys',category:'Accounts',difficulty:'Foundational',summary:'Multi-factor authentication adds a step beyond a password; passkeys can provide phishing-resistant sign-in.',works:'MFA asks for another proof of account access. Passkeys use cryptographic credentials tied to a device or platform and do not require typing a shared secret into a site.',signs:['An unexpected sign-in approval request','A caller asks you to read a one-time code','A sign-in page unexpectedly asks to disable MFA'],example:'TRAINING EXAMPLE: A surprise approval prompt appears while you are not signing in.',prevent:['Enable MFA or passkeys on important accounts','Deny requests you did not initiate','Store recovery codes safely offline'],response:'Deny unexpected prompts, change your password through the official service, and review active sessions.'},
  { title:'QR-code scams',category:'Messages',difficulty:'Foundational',summary:'A QR code can hide a destination, so treat it like an unfamiliar link.',works:'Scanning opens a URL that may imitate a payment page, login, or promotion. The code itself does not tell you whether the destination is trustworthy.',signs:['A code is placed over another code','Unexpected payment or login request after scanning','Destination domain does not match the expected service'],example:'TRAINING EXAMPLE: A printed “event Wi-Fi” sticker sends visitors to a fictional login page on example.com.',prevent:['Preview the destination before opening','Check the full domain before entering information','Use official apps or typed addresses for payments'],response:'Close the page if it is unexpected. If you entered credentials, change them through the genuine service and review sessions.'},
  { title:'Fake giveaways, investment & shopping scams',category:'Money & identity',difficulty:'Foundational',summary:'Fraudulent offers use prizes, extraordinary returns, or limited-time deals to prompt rushed decisions.',works:'A fake seller or promoter may ask for advance fees, personal details, or payment through hard-to-reverse methods.',signs:['Guaranteed returns or “risk-free” claims','Fees required to claim a surprise prize','Pressure to pay outside a trusted platform'],example:'TRAINING EXAMPLE: A fictional prize message asks for a processing fee at example.com.',prevent:['Research sellers and offers independently','Be skeptical of guaranteed returns and surprise wins','Use platform payment protections where available'],response:'Stop payments and contact your bank or payment provider promptly through verified contact details.'},
  { title:'Romance & friendship scams',category:'Money & identity',difficulty:'Foundational',summary:'Scammers may build a relationship online and later ask for money, gifts, or private information.',works:'The person may avoid meeting or video calls, invent emergencies, or steer conversations toward investments or payments.',signs:['A new contact asks for money or financial help','Requests for intimate images or secrecy','A repeated emergency blocks independent verification'],example:'TRAINING EXAMPLE: A fictional online friend asks for a transfer to solve an urgent travel problem.',prevent:['Take time before making financial decisions','Verify identity in more than one way','Talk with someone you trust before sending money or intimate material'],response:'Do not send more money or images. Preserve relevant messages safely, report the account, and seek support without blame.'},
  { title:'Online payment & marketplace fraud',category:'Money & identity',difficulty:'Intermediate',summary:'Marketplace fraud can involve fake listings, payment confirmations, or attempts to move a transaction off-platform.',works:'A buyer or seller may use forged receipts, fake delivery notices, or pressure to use an unprotected payment route.',signs:['Payment confirmation only appears in a message or screenshot','Requests to leave the marketplace platform','Unusual overpayment or refund instructions'],example:'TRAINING EXAMPLE: A fictional buyer sends a “payment receipt” and asks the seller to refund an excess amount.',prevent:['Confirm payment inside the official account','Keep communications and payments on the platform','Review buyer and seller protection terms'],response:'Pause the transaction and contact platform support using its official app or site. Contact your payment provider if money moved.'},
  { title:'Public Wi-Fi & safer connections',category:'Devices',difficulty:'Intermediate',summary:'Public networks are convenient; use sensible protections and verify the network before joining.',works:'A misleading network name can imitate a venue. Encrypted websites protect data in transit, but public Wi-Fi does not make a site trustworthy.',signs:['Several similar network names','A network asks for unusual personal information','Unexpected certificate or browser warnings'],example:'TRAINING EXAMPLE: A café has two similarly named public networks, one posted nowhere in the venue.',prevent:['Confirm network details with staff','Prefer trusted mobile data for sensitive tasks','Keep device sharing features off on public networks'],response:'Disconnect if a network seems suspicious. If credentials were entered into an unexpected page, update them through the official service.'},
  { title:'SIM-swap & phone-number takeover',category:'Accounts',difficulty:'Intermediate',summary:'A SIM swap can redirect a phone number to another SIM, potentially affecting accounts that rely on SMS.',works:'A fraudster may impersonate a customer to a mobile provider. A sudden loss of service can have many causes, but should be checked promptly.',signs:['Unexpected loss of mobile service','Provider account changes you did not request','Password reset alerts you did not initiate'],example:'TRAINING EXAMPLE: A phone unexpectedly loses service while account reset notices arrive.',prevent:['Set a carrier account PIN where available','Prefer authenticator apps or passkeys over SMS where supported','Keep account recovery options current'],response:'Contact your mobile provider through verified channels, secure important accounts, and report unauthorized changes.'},
  { title:'Deepfake audio, video & AI impersonation',category:'Messages',difficulty:'Intermediate',summary:'Synthetic media can imitate a person’s voice or appearance; familiar voices are not reliable proof by themselves.',works:'Generated or edited audio and video can create convincing requests, especially under time pressure.',signs:['Urgent money or secrecy request','A voice call that cannot be independently verified','Details conflict with what you know about the person'],example:'TRAINING EXAMPLE: A fictional audio message appears to be from a relative asking for a private transfer.',prevent:['Verify using a separate known contact method','Use a family verification phrase','Pause before sending money or sharing sensitive information'],response:'Call the person using a saved number or contact another trusted person. Report impersonation to the platform.'},
  { title:'Data breaches & identity theft',category:'Money & identity',difficulty:'Intermediate',summary:'A breach exposes information held by an organization; identity misuse can follow, but not every breach leads to fraud.',works:'Data may be copied from a service and later used in impersonation or account recovery attempts.',signs:['Official breach notice from a service you use','Unfamiliar account activity or credit inquiries','Unexpected password reset or verification messages'],example:'TRAINING EXAMPLE: A fictional service notifies users that email addresses may have been exposed.',prevent:['Use unique passwords and MFA','Keep recovery contact information current','Be cautious of follow-up messages exploiting a breach announcement'],response:'Follow the service’s official guidance, update reused passwords, and monitor relevant accounts. Report identity misuse locally as appropriate.'},
  { title:'Domain spoofing & lookalike websites',category:'Browsing',difficulty:'Intermediate',summary:'A lookalike domain uses similar spelling or formatting to resemble a familiar website.',works:'A tiny spelling change, extra word, or misleading subdomain can make a web address appear familiar at a glance.',signs:['Misspellings or extra words in the domain','Brand name appears only in a subdomain','Unexpected redirects or unfamiliar page address'],example:'TRAINING EXAMPLE: A fictional page uses “account-example.com” instead of the expected “example.com”.',prevent:['Read the domain from right to left around its final domain ending','Use bookmarks for important services','Do not trust a logo as proof of identity'],response:'Close the page without entering data. If you submitted credentials, change them on the verified official website.'},
  { title:'Browser security, HTTPS & certificates',category:'Browsing',difficulty:'Intermediate',summary:'HTTPS encrypts a connection to a website; it does not prove that the site or its claims are trustworthy.',works:'A certificate helps a browser establish an encrypted connection to a domain. A deceptive site can also use HTTPS.',signs:['Browser certificate warning','Domain differs from the service you intended','A page requests information unrelated to its purpose'],example:'TRAINING EXAMPLE: A fictional shopping page on example.com has HTTPS but is still an unfamiliar seller.',prevent:['Check the domain and purpose, not just the lock icon','Never bypass browser security warnings casually','Use trusted sources for important services'],response:'Leave a suspicious or warning-marked page. Contact the organization through a known, independent channel.'},
  { title:'Software updates & patch management',category:'Devices',difficulty:'Foundational',summary:'Updates fix bugs and known security weaknesses; installing them through official channels helps reduce avoidable risk.',works:'Software providers release updates that may include security fixes. Delaying updates can leave known issues unaddressed.',signs:['A device has pending updates for a long time','A pop-up from an unrelated site offers a patch','An app no longer receives supported updates'],example:'TRAINING EXAMPLE: A browser page offers an “urgent system patch” download unrelated to device settings.',prevent:['Turn on automatic updates where practical','Update through system settings or the official app store','Replace software that has reached end of support'],response:'Use the official update mechanism. If an unexpected installer was run, seek trusted technical help.'},
  { title:'Data backups & account recovery',category:'Accounts',difficulty:'Foundational',summary:'Backups and recovery options make it easier to regain important files or accounts after an incident.',works:'A backup is useful when it is current, protected, and possible to restore. Recovery methods should remain under your control.',signs:['Only one copy of important files','Recovery email or phone is outdated','Recovery codes are stored in an easily accessed place'],example:'TRAINING EXAMPLE: A device failure leaves important family photos on a single drive.',prevent:['Keep more than one copy of important files','Store one backup separately from the device','Review recovery options and test a small restore'],response:'Use the service’s official recovery process. Restore only from a backup you trust and protect recovery codes.'},
  { title:'Digital privacy, permissions & tracking',category:'Privacy',difficulty:'Foundational',summary:'Apps and websites may collect data through permissions, cookies, or account settings; informed choices help limit unnecessary exposure.',works:'Permissions grant access to device features, while trackers can observe activity across pages or services.',signs:['An app requests unrelated device access','Privacy controls are difficult to locate','Unexpected personalization or tracking prompts'],example:'TRAINING EXAMPLE: A flashlight utility requests location access with no clear reason.',prevent:['Grant only permissions that fit the feature','Review browser and account privacy controls','Remove apps and extensions you no longer need'],response:'Revoke unnecessary permissions and review data-sharing settings. Consult the service’s privacy controls for deletion options.'},
  { title:'Cyberbullying, suspicious contact & harassment',category:'Privacy',difficulty:'Foundational',summary:'Unwanted online contact can be upsetting; safety and support matter more than responding to every message.',works:'Harassment may include repeated unwanted messages, impersonation, threats, or sharing private information without consent.',signs:['Repeated contact after you asked for it to stop','Threats or attempts to move conversations into secrecy','Pressure to send private images or information'],example:'TRAINING EXAMPLE: A fictional account repeatedly messages someone after they have asked for no contact.',prevent:['Use privacy and blocking controls','Limit personal details visible to strangers','Tell a trusted person and preserve evidence safely'],response:'Do not engage if it feels unsafe. Block and report the account, save relevant evidence, and contact local support or authorities for threats.'},
  { title:'Safer social media practices',category:'Privacy',difficulty:'Foundational',summary:'Thoughtful privacy settings and sharing habits can reduce unwanted exposure while keeping social connection.',works:'Posts, profile details, and account recovery hints can reveal more over time, even when shared with a limited audience.',signs:['Public contact details or location patterns','Unexpected login alerts','Quizzes or posts asking for security-answer details'],example:'TRAINING EXAMPLE: A public post reveals a pet name also used as an account recovery answer.',prevent:['Review audience and location settings','Avoid sharing security-answer information','Use unique passwords and MFA'],response:'Remove exposed details where possible, review account sessions and privacy settings, and report impersonation.'},
  { title:'Recognize & report suspicious messages',category:'Messages',difficulty:'Foundational',summary:'A suspicious message deserves a pause, independent verification, and a report through the right channel.',works:'Scams often combine impersonation, an unexpected request, and pressure to act before checking.',signs:['Urgency, secrecy, or threats','Unexpected links, attachments, or payment requests','Requests for passwords, codes, or financial details'],example:'TRAINING EXAMPLE: A fictional “support” message asks you to verify your password at example.com.',prevent:['Do not use contact details or links supplied in the message','Verify through an official app, known number, or saved bookmark','Report the message to the platform or organization'],response:'Stop interacting, preserve relevant evidence safely, and report it. CISA and FTC guidance is linked below.'}
];
const scenarios = [
  { subject:'A sign-in you did not make', sender:'Account Desk <help@account-alert.example.com>', text:'We noticed unusual activity. Your access will be paused in 30 minutes. Review your account now at example.com/security to keep access.', safe:'suspicious', clue:'A pressure deadline, unfamiliar sender, and a link that is not independently verified are reasons to pause. Open the service through a saved bookmark instead.' },
  { subject:'Your parcel is waiting', sender:'Delivery notice <updates@parcel.example.com>', text:'We could not complete delivery. Confirm a small redelivery fee at example.com/route. Reply with your card details if the page does not load.', safe:'suspicious', clue:'Unexpected fees and requests for card details through a message are warning signs. Check a delivery directly in the carrier’s official app or website.' },
  { subject:'Your library hold is ready', sender:'Community Library <notices@library.example.com>', text:'The book you reserved is ready for pickup. You can check hours and directions on your usual library website. No sign-in is needed from this message.', safe:'legitimate', clue:'This message is low-pressure and asks for no sensitive information. Still, if unsure, visit the library’s known website directly rather than relying on a message link.' }
];
const checklist = ['I use a unique password for important accounts','I enable MFA or passkeys where available','My device and browser software are up to date','I review app permissions and browser extensions','I keep a separate backup of important files','I verify unexpected requests through another channel','I check a website’s domain before signing in','I know how to report a suspicious message'];
const browserTips = ['Verify the actual domain before entering sensitive information.','Avoid unexpected downloads and installers.','Review browser permissions and notification settings.','Keep your browser and operating system updated.','Use a reputable password manager for unique passwords.','Enable MFA or passkeys on important accounts.','Treat shortened URLs as unfamiliar until verified.','Review extension permissions and remove extensions you do not need.','HTTPS encrypts a connection; it does not prove a site is trustworthy.','Do not enter sensitive information into a suspicious website.'];
const services = ['Web Browsing','Email Accounts','Messaging Apps','Social Media','Online Shopping','Downloads and Files','Personal Privacy','Account Security','Family Digital Safety','General Device Awareness'];
const refs = [
  ['CISA · Recognize and report phishing','https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'],
  ['FTC · Protect yourself from phishing scams','https://consumer.ftc.gov/consumer-alerts/2025/04/protect-yourself-phishing-scams'],
  ['NIST · Create a good password','https://www.nist.gov/cybersecurity-and-privacy/how-do-i-create-good-password'],
  ['NIST · Phishing guidance','https://www.nist.gov/itl/smallbusinesscyber/guidance-topic/phishing'],
  ['ngCERT · Individual incident reporting (Nigeria)','https://cert.gov.ng/incident-report/individual']
];

function useStored<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => { try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : initial; } catch { return initial; } });
  const save = (next: T) => { setValue(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage may be unavailable */ } };
  return [value, save];
}
function Logo({ compact=false }: { compact?: boolean }) {
  return <span className="flex items-center gap-2.5" aria-label="Digital Safety">
    <svg className="max-[440px]:!h-8 max-[440px]:!w-8" width="38" height="40" viewBox="0 0 40 42" role="img" aria-label="Shield, check and network mark">
      <path d="M20 2 35 8v11c0 9-6 16-15 21C11 35 5 28 5 19V8l15-6Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="m12 21 5 5 10-11" fill="none" stroke="#39a998" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="30" r="2" fill="#d99d55"/><path d="m27 26 3 3" stroke="#d99d55" strokeWidth="1.5"/>
    </svg>
    {!compact && <span className="leading-tight"><b className="display block whitespace-nowrap text-[14px] sm:text-[15px]">Digital Safety</b><small className="max-[440px]:hidden text-[10px] text-muted-foreground">Safer Browsing Experience</small></span>}
  </span>;
}
function DemoRegister({onClose}:{onClose:()=>void}) {
 const [displayName,setDisplayName]=useState(''); const [notice,setNotice]=useState('');
 const submit=(e:FormEvent)=>{e.preventDefault(); if(!displayName.trim()){setNotice('Add a display name to continue.');return;} setNotice(`Welcome, ${displayName.trim()} — demo registration complete for this preview only.`);};
 return createPortal(<div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="demo-register-title" onClick={onClose}><section className="cyber-panel w-full max-w-md p-6 sm:p-8" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><span className="eyebrow">Local demo account</span><h2 id="demo-register-title" className="display mt-2 text-3xl font-extrabold">Join the learning space</h2></div><button className="btn btn-quiet !min-h-9 !px-3" onClick={onClose} aria-label="Close registration"><X size={17}/></button></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Try the registration experience without creating a real account. Nothing is sent to a server.</p><form className="mt-6 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm font-semibold">Display name<input className="field" value={displayName} onChange={e=>{setDisplayName(e.target.value);setNotice('')}} maxLength={40} placeholder="Choose a name" required /></label><div className="rounded-xl border border-border bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground">Demo-only: no password, email, phone number, or sensitive information is requested. Your name is not saved or transmitted.</div>{notice&&<p className="text-sm font-semibold text-primary" role="status">{notice}</p>}<div className="flex flex-wrap gap-2"><button className="btn btn-primary" type="submit"><UserPlus size={16}/> Register demo</button><button className="btn btn-soft" type="button" onClick={onClose}>Cancel</button></div></form></section></div>, document.body);
}
function SessionTimer(){
 const [seconds,setSeconds]=useState(0);
 useEffect(()=>{let start=Number(sessionStorage.getItem('ds-session-start'));if(!start||!Number.isFinite(start)){start=Date.now();sessionStorage.setItem('ds-session-start',String(start));}const id=window.setInterval(()=>setSeconds(Math.floor((Date.now()-start)/1000)),1000);setSeconds(Math.floor((Date.now()-start)/1000));return()=>window.clearInterval(id)},[]);
 const fmt=(n:number)=>`${String(Math.floor(n/3600)).padStart(2,'0')}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 return <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs text-white/80" title="Time spent in this browser session"><Clock3 size={14} className="text-[#00ffea]"/> SESSION <b className="text-[#00ffea]">{fmt(seconds)}</b></span>;
}
function Nav() {
 const [registerOpen,setRegisterOpen]=useState(false);

  const [location] = useLocation();
  const [dark, setDark] = useStored('ds-theme', true);
  const [open,setOpen] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle('dark',dark); },[dark]);
  const items = [['Home','/'],['Learn','/learn'],['Threat Library','/threat-library'],['Safety Check','/safety-check'],['Device Protection','/device-protection'],['Pros & Cons','/pros-cons'],['Privacy','/privacy']];
  return <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
    <div className="shell flex h-[76px] items-center justify-between gap-5">
      <Link href="/" className="nav-link"><Logo/></Link>
      <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
        {items.map(([name,path])=><Link key={path} href={path} className="nav-link" aria-current={location===path?'page':undefined} data-testid={`nav-${path.slice(1)||'home'}`}>{name}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <button className="btn btn-quiet !min-h-9 !px-2 sm:!min-h-10 sm:!px-3" aria-label={dark?'Switch to light theme':'Switch to dark theme'} onClick={()=>setDark(!dark)} data-testid="button-theme-toggle">{dark?<Sun size={17}/>:<Moon size={17}/>}<span className="sr-only">Toggle theme</span></button>
        <Link href="/device-protection" aria-label="Get Protected — Feature information" className="btn btn-primary !min-h-10 !px-2 sm:!px-4 !text-[10px] sm:!text-xs whitespace-nowrap" data-testid="link-get-protected"><span className="hidden min-[381px]:inline">Get Protected</span><ArrowRight size={15} aria-hidden="true"/></Link>
        <button className="btn btn-neon hidden sm:inline-flex !min-h-10 !px-3 !text-xs" onClick={()=>setRegisterOpen(true)}><UserPlus size={15}/> Register Demo</button><button className="btn btn-quiet !min-h-9 !px-2 sm:!min-h-10 sm:!px-3 lg:hidden" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)} data-testid="button-mobile-menu">{open?<X size={18}/>:<Menu size={18}/>}</button>
      </div>
    </div>
    {open && <nav className="shell grid gap-1 pb-4 lg:hidden" aria-label="Mobile navigation">{items.map(([name,path])=><Link key={path} href={path} onClick={()=>setOpen(false)} className="nav-link rounded-xl px-3 py-3 hover:bg-secondary" aria-current={location===path?'page':undefined} data-testid={`mobile-nav-${path.slice(1)||'home'}`}>{name}</Link>)}<button className="btn btn-neon mt-2" onClick={()=>{setOpen(false);setRegisterOpen(true)}}><UserPlus size={16}/> Register Demo</button></nav>}
    {registerOpen&&<DemoRegister onClose={()=>setRegisterOpen(false)}/>}
  </header>;
}
function Footer() {
  return <footer className="mt-24 border-t border-border bg-card">
    <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><Logo/><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Practical guidance, local link-risk checks, cache controls for this site, and safer everyday choices online. Native device scanning requires a separate module.</p><span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Project</span></div>
      <div><b className="text-sm">Explore</b><div className="mt-4 grid gap-3 text-sm text-muted-foreground"><Link href="/learn" className="nav-link">Learn</Link><Link href="/threat-library" className="nav-link">Threat library</Link><Link href="/device-protection" className="nav-link">Device Protection</Link><Link href="/pros-cons" className="nav-link">Pros & Cons</Link><Link href="/safety-check" className="nav-link">Safety Check</Link></div></div>
      <div><b className="text-sm">Trust, first</b><div className="mt-4 grid gap-3 text-sm text-muted-foreground"><Link href="/privacy" className="nav-link">Privacy and Ethics</Link><a className="nav-link" href="/privacy#faq">FAQ</a><p className="text-xs leading-5">Local URL heuristics and education only. Not a full antivirus, professional audit, or guarantee of safety.</p></div></div>
    </div>
    <div className="shell pb-8"><section className="owner-panel p-5 sm:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]"><div><p className="eyebrow">Built by the creator</p><h2 className="display mt-2 text-3xl font-extrabold">DEVZIKKY <span className="neon-text">/ Digital Builder</span></h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Digital Safety is an educational concept created to make online security easier to understand. Explore the creator’s portfolio and related project spaces below.</p><div className="mt-4 flex flex-wrap gap-2"><a className="btn btn-neon !min-h-10 !px-4 !text-xs" href="https://zikkytech.vercel.app" target="_blank" rel="noopener noreferrer"><Globe size={15}/> Portfolio</a><a className="btn btn-soft !min-h-10 !px-4 !text-xs" href="https://zikkytech.xo.je" target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> DEVZIKKY TECH</a></div></div><div><p className="eyebrow">Related projects</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><a className="project-link" href="https://zmail.zone.id" target="_blank" rel="noopener noreferrer"><ShieldCheck size={17}/><span><b>ZMAIL STUDIO</b><small>Mail project</small></span><ExternalLink size={13}/></a><a className="project-link" href="https://zquote-tau.vercel.app" target="_blank" rel="noopener noreferrer"><BookOpen size={17}/><span><b>ZQUOTE</b><small>Quotes project</small></span><ExternalLink size={13}/></a><a className="project-link" href="https://zikky-ai.xo.je" target="_blank" rel="noopener noreferrer"><Code2 size={17}/><span><b>DEVZIKKY AI</b><small>AI project</small></span><ExternalLink size={13}/></a><a className="project-link" href="https://zikkymangahub.onrender.com" target="_blank" rel="noopener noreferrer"><BookOpen size={17}/><span><b>ZIKKY MANGA HUB</b><small>Manga project</small></span><ExternalLink size={13}/></a></div></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs text-muted-foreground">Owner links are public portfolio/project links supplied for this footer.</span><SessionTimer/></div></section></div>
    <div className="border-t border-border"><div className="shell flex flex-col gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} Digital Safety · Project · Made by DEVZIKKY</span><span>Illustrative education. No live protection or security checks.</span></div></div>
  </footer>;
}
function FloatingInstallButton() {
 const [, navigate] = useLocation();
 const [open,setOpen] = useState(false);
 const [platform,setPlatform] = useState<Platform>('checking');
 const [comingSoon,setComingSoon] = useState(false);
 useEffect(()=>{setPlatform(detectClientPlatform());},[]);
 const platformLabel = platform === 'android' ? 'Android phone' : platform === 'ios' ? 'iPhone / iPad' : ['windows','macos','linux'].includes(platform) ? 'PC / laptop' : 'this device';
 function choose(target:'android'|'desktop'|'ios') {
   if(target==='ios'){setComingSoon(true);return;}
   setOpen(false); navigate(target==='android'?'/install/android':'/install/desktop');
 }
 return <>
  <button className="install-fab" onClick={()=>{setOpen(true);setComingSoon(false);}} aria-haspopup="dialog" aria-expanded={open} data-testid="button-floating-install"><Download size={17}/><span>Install Digital Safety</span></button>
  {open&&<div className="install-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}><section className="install-modal panel" role="dialog" aria-modal="true" aria-labelledby="install-modal-title"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Platform setup</p><h2 id="install-modal-title" className="display mt-2 text-2xl font-extrabold">Choose your device</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">We detected <b>{platformLabel}</b>. Choose where you want to use Digital Safety.</p></div><button className="btn btn-quiet !min-h-9 !p-2" aria-label="Close installer" onClick={()=>setOpen(false)}><X size={17}/></button></div>
   <div className="mt-5 grid gap-3 sm:grid-cols-3"><button className="install-choice" onClick={()=>choose('android')}><Smartphone size={26}/><b>Android</b><small>APK setup guide</small></button><button className="install-choice" onClick={()=>choose('desktop')}><Monitor size={26}/><b>PC / Laptop</b><small>Browser extension</small></button><button className="install-choice install-choice-disabled" onClick={()=>choose('ios')}><Smartphone size={26}/><b>iPhone</b><small>Coming soon</small></button></div>
   {comingSoon&&<div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm" role="status">The iPhone version is coming later. No iOS download is available at this time.</div>}
   <p className="mt-5 text-xs leading-5 text-muted-foreground">Digital Safety is free. The PC extension is a limited, user-triggered link checker; the native Android malware scanner still requires separate implementation.</p>
   <div className="mt-4 border-t border-border pt-4"><Link href="/pros-cons" onClick={()=>setOpen(false)} className="text-sm font-bold text-primary underline underline-offset-4">Review pros, cons & feature limits</Link></div>
  </section></div>}
 </>;
}
function PageFrame({ children }: { children: ReactNode }) { return <><Nav/><main id="main-content">{children}</main><section className="shell site-image-pair" aria-label="Digital Safety visual stories"><figure><img src="/images/digital-safety-atm-black.jpg" alt="Digital Safety banking awareness at an ATM" loading="lazy"/><figcaption><span className="eyebrow">SAFER BANKING</span><b className="display">Pause. Verify. Protect your details.</b></figcaption></figure><figure><img src="/images/digital-safety-branding-neon.jpg" alt="Digital Safety awareness environment with purple cybersecurity branding" loading="lazy"/><figcaption><span className="eyebrow">SAFER DIGITAL SPACES</span><b className="display">Build safer habits, one choice at a time.</b></figcaption></figure></section><Footer/><FloatingInstallButton/></>; }
function VisualStrip({kind='browsing'}:{kind?:'browsing'|'devices'|'privacy'|'messages'|'accounts'}) {
 const map={browsing:['/images/topic-browsing.jpg','/images/learning-path.jpg'],devices:['/images/topic-devices.jpg','/images/cyber-hero.jpg'],privacy:['/images/topic-privacy.jpg','/images/topic-money-identity.jpg'],messages:['/images/topic-messages.jpg','/images/topic-accounts.jpg'],accounts:['/images/topic-accounts.jpg','/images/topic-money-identity.jpg']} as const;
 const [a,b]=map[kind];
 return <div className="visual-strip mb-9 grid gap-4 sm:grid-cols-[1.15fr_.85fr]"><div className="visual-strip-main"><img src={a} alt="Cybersecurity education illustration" loading="lazy"/><div><span className="eyebrow">VISUAL EXPLAINER</span><b className="display mt-2 block text-xl">Understand the risk before choosing your next step.</b></div></div><div className="visual-strip-side"><img src={b} alt="Illustration for digital safety education" loading="lazy"/><p className="text-xs leading-5 text-muted-foreground">Original-style educational imagery. No live scanning or threat detection is represented.</p></div></div>;
}
function SectionTitle({kicker,title,description}: {kicker:string;title:string;description:string}) { return <div className="mb-8 max-w-2xl"><p className="eyebrow">{kicker}</p><h1 className="display mt-3 text-4xl font-extrabold leading-[1.08] sm:text-5xl">{title}</h1><p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p></div>; }
function NetworkArt() { return <svg className="w-full max-w-[440px]" viewBox="0 0 480 360" role="img" aria-label="Editorial illustration of connected devices and a shield; not a scan">
  <defs><linearGradient id="artwash" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#cae9e2"/><stop offset="1" stopColor="#e7e2d4"/></linearGradient></defs>
  <rect x="42" y="30" width="396" height="296" rx="40" fill="url(#artwash)" opacity=".8"/>
  <path d="M108 183h79m111 0h62M240 89v53m0 83v45M142 118l55 37m86-37-51 37m-91 59 59-34m86 0 58 34" stroke="#4d968a" strokeWidth="2" strokeDasharray="4 6"/>
  <rect x="78" y="143" width="70" height="89" rx="12" fill="#fff" stroke="#91b8b0" strokeWidth="2"/><rect x="88" y="155" width="50" height="62" rx="5" fill="#d8efea"/><circle cx="113" cy="224" r="2" fill="#398c82"/>
  <rect x="332" y="137" width="79" height="54" rx="8" fill="#fff" stroke="#91b8b0" strokeWidth="2"/><path d="M324 197h95l-8 9h-79l-8-9Z" fill="#769e97"/>
  <rect x="198" y="48" width="84" height="54" rx="10" fill="#fff" stroke="#91b8b0" strokeWidth="2"/><path d="M213 66h53M213 76h37M213 86h43" stroke="#a7cbc4" strokeWidth="3" strokeLinecap="round"/>
   <path className="hero-shield" d="M240 140 280 155v31c0 25-17 45-40 58-23-13-40-33-40-58v-31l40-15Z" fill="#176f68"/><path d="m222 184 12 12 25-29" fill="none" stroke="#f1d994" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="146" cy="114" r="7" fill="#d9a252"/><circle cx="323" cy="113" r="6" fill="#d9a252"/><circle cx="165" cy="261" r="5" fill="#d9a252"/><circle cx="311" cy="254" r="7" fill="#d9a252"/>
  </svg>; }
function MilestoneCounter() {
  const [count,setCount]=useState(0);
  const counterRef=useRef<HTMLDivElement>(null);
  const started=useRef(false);
  useEffect(()=>{
    const node=counterRef.current;
    if(!node)return;
    const start=()=>{
      if(started.current)return;
      started.current=true;
      const target=10_000_000;
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setCount(target);return;}
      const startTime=performance.now();
      const duration=1900;
      const tick=(now:number)=>{
        const progress=Math.min((now-startTime)/duration,1);
        const eased=1-Math.pow(1-progress,3);
        setCount(Math.max(1,Math.floor(target*eased)));
        if(progress<1)window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    if(!('IntersectionObserver' in window)){start();return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){start();observer.disconnect();}
    },{threshold:0.35});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);
  const shown=count>=10_000_000?'10M':count>=1_000_000?`${(count/1_000_000).toFixed(1)}M`:count.toLocaleString();
  return <div ref={counterRef} className="display text-5xl font-extrabold tracking-tight text-primary sm:text-6xl" aria-label="10,000,000 illustrative milestone, not verified users" data-testid="counter-demo-milestone">{shown}</div>;
}
function Home() {
  const [learned] = useStored<string[]>('ds-learned',[]);
  const [safeDone] = useStored<number[]>('ds-browser-check',[]);
  return <PageFrame>
    <section className="shell grid min-h-[620px] items-center gap-8 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.45}} className="fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold"><ShieldCheck size={15} className="text-primary"/> Privacy first <span className="text-muted-foreground">·</span> Security awareness</div>
        <p className="eyebrow">Safer Browsing Experience</p>
        <h1 className="display mt-4 max-w-[650px] text-5xl font-extrabold leading-[1.03] sm:text-6xl lg:text-[68px]">Your Digital World.<br/><span className="text-primary">Safer by design.</span></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Review suspicious link patterns locally, recognize scams before they catch you, and learn practical ways to protect your accounts, devices and personal information.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link className="btn btn-primary" href="/learn" data-testid="link-explore-guide">Explore Security Guide <ArrowRight size={17}/></Link><Link className="btn btn-soft" href="/safety-check" data-testid="link-check-safety">Check My Safety</Link></div>
        <p className="mt-6 flex max-w-lg items-start gap-2 text-xs leading-5 text-muted-foreground"><CircleHelp size={15} className="mt-0.5 shrink-0"/>This free preview includes educational tools and user-triggered URL checks. It does not perform a device-wide malware scan or modify other apps.</p>
      </motion.div>
      <div className="relative flex min-h-[380px] items-center justify-center">
        <div className="absolute inset-x-8 top-10 h-[320px] rounded-[48%] bg-[#d5eee8] opacity-70 dark:bg-[#1b4743]"/>
        <NetworkArt/>
        <div className="absolute bottom-1 right-1 rounded-2xl border border-border bg-card p-4 shadow-sm sm:bottom-6 sm:right-0"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><BookOpen size={20}/></span><div><p className="text-xs text-muted-foreground">Your learning space</p><b className="text-sm">{learned.length} of 28 lessons explored</b></div></div><div className="progress-track mt-3 w-48"><span style={{width:`${learned.length/28*100}%`}}/></div></div>
      </div>
    </section>
    <section className="bg-[#e6f2ee] py-14 dark:bg-[#142a2b]"><div className="shell grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-center">
      <div><span className="eyebrow">10M MILESTONE</span><h2 className="display mt-3 text-4xl font-extrabold">Safer habits, one choice at a time.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Illustrative community milestone — not a verified user count. This figure is a visual only and does not represent actual customers.</p></div>
       <div className="panel flex items-center gap-5 p-6 sm:p-8"><MilestoneCounter/><div><b className="block">Small pauses make a difference.</b><p className="mt-2 text-sm text-muted-foreground">A learning milestone, not a claim about people using this demo.</p></div></div>
    </div></section>
    <section className="shell py-8"><div className="media-banner"><div><p className="eyebrow">THE DIGITAL SAFETY FIELD GUIDE</p><h2 className="display mt-3 text-3xl font-extrabold sm:text-4xl">Security concepts, made easier to see.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Visual guides connect the ideas behind browsing, messaging, devices, identity and privacy. Every illustration is educational—not a live security signal.</p><Link className="btn btn-neon mt-5" href="/threat-library">Explore visual lessons <ArrowRight size={16}/></Link></div><div className="media-grid"><figure><img src="/images/topic-accounts.jpg" alt="Illustration representing account security" loading="lazy"/><figcaption>Account security</figcaption></figure><figure><img src="/images/topic-browsing.jpg" alt="Illustration representing browser safety" loading="lazy"/><figcaption>Safer browsing</figcaption></figure><figure><img src="/images/topic-messages.jpg" alt="Illustration representing suspicious messages" loading="lazy"/><figcaption>Message awareness</figcaption></figure><figure><img src="/images/topic-privacy.jpg" alt="Illustration representing digital privacy" loading="lazy"/><figcaption>Privacy by design</figcaption></figure></div></div></section>
    <section className="shell py-16"><p className="eyebrow">A different kind of safety product</p><h2 className="display mt-3 max-w-xl text-3xl font-extrabold sm:text-4xl">Built around understanding, not alarm.</h2><div className="mt-9 grid gap-4 md:grid-cols-4">
      {[['01','Privacy comes first','Your choices stay in this browser demo. No account or secrets requested.'],['02','Education over fear','Clear examples help you pause and decide what to do next.'],['03','Transparent limitations','We say what this experience can—and cannot—do.'],['04','Safer habits for everyone','Practical steps for daily browsing, at your own pace.']].map(([n,t,d])=><article key={n} className="border-t-2 border-primary/40 py-5"><span className="mono text-xs text-primary">{n} / PRINCIPLE</span><h3 className="display mt-4 text-lg font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></article>)}
    </div></section>
    <section className="shell pb-12"><div className="grid gap-4 md:grid-cols-3">
      <Link href="/threat-library" className="panel group p-6 no-underline transition hover:-translate-y-1" data-testid="link-threat-library-card"><Shield size={22} className="text-primary"/><h3 className="display mt-5 text-xl font-bold">A clearer view of threats</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">28 practical lessons, from suspicious messages to account recovery.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Browse library <ArrowRight size={15}/></span></Link>
      <Link href="/learn" className="panel p-6 no-underline transition hover:-translate-y-1" data-testid="link-simulator-card"><FileText size={22} className="text-primary"/><h3 className="display mt-5 text-xl font-bold">Practice without risk</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Inspect three fictional messages and learn what deserves a second look.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Try the simulator <ArrowRight size={15}/></span></Link>
      <Link href="/safety-check" className="panel p-6 no-underline transition hover:-translate-y-1" data-testid="link-safety-check-card"><CheckCircle2 size={22} className="text-primary"/><h3 className="display mt-5 text-xl font-bold">A personal starting point</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Reflect on your habits and leave with a few useful next steps.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Take a safety check <ArrowRight size={15}/></span></Link>
    </div></section>
    <section className="shell my-10 rounded-[28px] bg-[#1c3f3d] p-7 text-white sm:p-10"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="eyebrow !text-[#9bd9cc]">Take it at your pace</p><h2 className="display mt-3 text-3xl font-extrabold">A better next step starts with a question.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Try a self-reported checklist or read what to do when a message feels wrong. No pressure, no device checks.</p></div><Link href="/device-protection" className="btn bg-[#f0d59c] text-[#203a38]" data-testid="link-device-demo">Explore the <ArrowRight size={16}/></Link></div></section>
  </PageFrame>;
}

function LessonDetail({lesson,onClose,onRelated,learned,onLearn,bookmarked,onBookmark}:{lesson:Lesson;onClose:()=>void;onRelated:(lesson:Lesson)=>void;learned:boolean;onLearn:()=>void;bookmarked:boolean;onBookmark:()=>void}) {
  const dialogRef=useRef<HTMLDivElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const dialog=dialogRef.current;
    const focusable=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')??[]);
    const handleKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.stopPropagation();onClose();return;}
      if(event.key==='Tab'){
        const items=focusable();
        if(!items.length)return;
        if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items[items.length-1].focus();}
        else if(!event.shiftKey&&document.activeElement===items[items.length-1]){event.preventDefault();items[0].focus();}
      }
    };
    closeRef.current?.focus();
    document.body.style.overflow='hidden';
    document.addEventListener('keydown',handleKeyDown);
    return()=>{document.removeEventListener('keydown',handleKeyDown);document.body.style.overflow='';previous?.focus();};
  },[]);
  const related=lessons.filter(item=>item.title!==lesson.title&&item.category===lesson.category).slice(0,3);
  return <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="lesson-title" className="fixed inset-0 z-50 overflow-y-auto bg-[#142525]/50 p-3 backdrop-blur-sm sm:p-8" onClick={onClose}><article className="panel mx-auto my-3 max-w-3xl p-5 sm:my-10 sm:p-9" onClick={e=>e.stopPropagation()}>
    <div className="flex items-start justify-between gap-4"><div><span className="eyebrow">{lesson.category} · {lesson.difficulty}</span><h2 id="lesson-title" className="display mt-3 text-3xl font-extrabold">{lesson.title}</h2></div><button ref={closeRef} className="btn btn-quiet !min-h-10 !px-3" onClick={onClose} aria-label="Close lesson" data-testid="button-close-lesson"><X size={18}/></button></div>
   <p className="mt-5 text-base leading-7 text-muted-foreground">{lesson.summary}</p>
   <div className="lesson-art mt-6 overflow-hidden rounded-2xl"><img src={lesson.category==='Messages'?'/images/topic-messages.jpg':lesson.category==='Devices'?'/images/topic-devices.jpg':lesson.category==='Privacy'?'/images/topic-privacy.jpg':lesson.category==='Accounts'?'/images/topic-accounts.jpg':lesson.category==='Money & Identity'?'/images/topic-money-identity.jpg':'/images/topic-browsing.jpg'} alt={`Illustration for ${lesson.title}`} loading="lazy"/><div><span className="eyebrow">VISUAL FIELD GUIDE</span><b className="display mt-2 block text-xl">Recognize the pattern. Choose a safer next step.</b><p className="mt-2 text-sm leading-6 text-muted-foreground">Illustrative artwork for learning only; it does not represent a live scan or threat detection.</p></div></div>
   <div className="mt-7 grid gap-5 sm:grid-cols-2">
    {[['How it works',lesson.works],['Warning signs',lesson.signs.join(' · ')],['Fictional training example',lesson.example],['Practical prevention',lesson.prevent.join(' · ')],['If you encounter it',lesson.response]].map(([h,d])=><section key={h} className="rounded-2xl bg-secondary/60 p-4"><h3 className="text-sm font-bold">{h}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></section>)}
   </div>
    {related.length>0&&<section className="mt-7" aria-labelledby="related-topics-title"><h3 id="related-topics-title" className="display text-lg font-bold">Related topics</h3><div className="mt-3 flex flex-wrap gap-2">{related.map(item=><button key={item.title} className="btn btn-soft !min-h-9 !px-3 !text-xs" onClick={()=>onRelated(item)} data-testid={`button-related-${lessons.indexOf(item)+1}`}>{item.title}</button>)}</div></section>}
   <div className="mt-7 flex flex-wrap gap-3"><button className="btn btn-primary" onClick={onLearn} data-testid="button-mark-learned">{learned?<Check size={16}/>:<CheckCircle2 size={16}/>} {learned?'Learned':'Mark as learned'}</button><button className="btn btn-soft" onClick={onBookmark} data-testid="button-bookmark-lesson"><Bookmark size={16} fill={bookmarked?'currentColor':'none'}/>{bookmarked?'Saved':'Save for later'}</button><button className="btn btn-quiet" onClick={onClose} data-testid="button-close-detail">Close lesson</button></div>
 </article></div>;
}
function ThreatLibrary({learningOnly=false}:{learningOnly?:boolean}) {
  const [search,setSearch]=useState(''); const [category,setCategory]=useState('All topics'); const [selected,setSelected]=useState<Lesson|null>(null);
  const [learned,setLearned]=useStored<string[]>('ds-learned',[]); const [bookmarks,setBookmarks]=useStored<string[]>('ds-bookmarks',[]);
  const categories=['All topics',...Array.from(new Set(lessons.map(x=>x.category)))];
  const visible=useMemo(()=>lessons.filter(x=>(category==='All topics'||x.category===category)&&`${x.title} ${x.summary} ${x.category}`.toLowerCase().includes(search.toLowerCase())),[category,search]);
  return <PageFrame><div className="shell py-14">
    <SectionTitle kicker={learningOnly?'Practice & learn':'Threat library · 28 defensive lessons'} title={learningOnly?'Learn by noticing the details.':'A field guide for everyday digital life.'} description={learningOnly?'Explore practical lessons, then try the fictional message simulator. No real links, data collection, or trick questions.' :'Clear, actionable explanations of common online risks. Every example is fictional and every lesson focuses on prevention and response.'}/>
    <VisualStrip kind={learningOnly?'messages':'browsing'}/>
    {learningOnly&&<PhishingSimulator/>}
    <section className="mt-14" aria-labelledby="lessons-heading"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">The library</p><h2 id="lessons-heading" className="display mt-2 text-2xl font-extrabold">Explore all 28 lessons</h2><p className="mt-1 text-sm text-muted-foreground">{learned.length} marked learned · {bookmarks.length} saved for later</p></div><div className="w-full sm:w-auto"><label className="sr-only" htmlFor="lesson-search">Search lessons</label><div className="relative sm:w-72"><Search size={17} className="absolute left-3 top-3.5 text-muted-foreground"/><input id="lesson-search" className="field pl-10" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics…" data-testid="input-lesson-search"/></div></div></div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by category">{categories.map(c=><button className={`btn !min-h-9 !px-4 !text-xs ${category===c?'btn-primary':'btn-quiet'}`} key={c} onClick={()=>setCategory(c)} aria-pressed={category===c} data-testid={`filter-${c.toLowerCase().replace(/[^a-z]+/g,'-')}`}>{c}</button>)}</div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="content-lesson-results">{visible.map((l,i)=><button key={l.title} className="panel group flex min-h-[190px] flex-col items-start p-5 text-left transition hover:-translate-y-1 hover:border-primary/50" onClick={()=>setSelected(l)} data-testid={`card-lesson-${i+1}`}><span className="flex w-full items-center justify-between"><span className="eyebrow !text-[9px]">{l.category} · {l.difficulty}</span><span className="flex gap-2">{bookmarks.includes(l.title)&&<Bookmark size={15} fill="currentColor" className="text-primary"/>}{learned.includes(l.title)&&<CheckCircle2 size={16} className="text-primary"/>}</span></span><b className="display mt-4 text-lg font-bold leading-snug">{l.title}</b><span className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{l.summary}</span><span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold text-primary">Read lesson <ArrowRight size={13}/></span></button>)}</div>
      {visible.length===0&&<div className="panel mt-5 p-10 text-center" data-testid="empty-lesson-results"><Search size={24} className="mx-auto text-muted-foreground"/><h3 className="display mt-3 text-lg font-bold">No matching lessons</h3><p className="mt-2 text-sm text-muted-foreground">Try a shorter search or choose another category.</p><button className="btn btn-soft mt-5" onClick={()=>{setSearch('');setCategory('All topics')}} data-testid="button-clear-lesson-filters">Clear filters</button></div>}
    </section>
    {selected&&<LessonDetail lesson={selected} onClose={()=>setSelected(null)} onRelated={setSelected} learned={learned.includes(selected.title)} onLearn={()=>setLearned(learned.includes(selected.title)?learned.filter(t=>t!==selected.title):[...learned,selected.title])} bookmarked={bookmarks.includes(selected.title)} onBookmark={()=>setBookmarks(bookmarks.includes(selected.title)?bookmarks.filter(t=>t!==selected.title):[...bookmarks,selected.title])}/>}
  </div></PageFrame>;
}
function PhishingSimulator() {
 const [index,setIndex]=useState(0); const [answers,setAnswers]=useState<string[]>([]); const [choice,setChoice]=useState<string|null>(null); const [complete,setComplete]=useState(false);
 const s=scenarios[index]; const progress=complete?100:(index+(choice?1:0))/scenarios.length*100;
 const submit=(a:string)=>{if(choice)return;setChoice(a);setAnswers([...answers,a]);};
 const next=()=>{if(index===scenarios.length-1){setComplete(true)}else{setIndex(index+1);setChoice(null)}};
 const score=answers.filter((a,i)=>a===scenarios[i].safe).length;
 return <section className="panel overflow-hidden" aria-labelledby="simulator-title">
  <div className="grid lg:grid-cols-[.83fr_1.17fr]"><div className="bg-[#1c3f3d] p-6 text-white sm:p-8"><span className="eyebrow !text-[#9bd9cc]">A fictional message exercise</span><h2 id="simulator-title" className="display mt-3 text-3xl font-extrabold">Would you pause here?</h2><p className="mt-3 text-sm leading-6 text-white/75">Look for the details. This practice uses invented names and example.com links. Nothing opens outside this page.</p>
   <div className="mt-8 flex items-center justify-between text-xs"><span className="mono">SCENARIO {complete?3:index+1} / 3</span><span>{complete?'Complete':`${Math.round(progress)}% complete`}</span></div><div className="progress-track mt-3 bg-white/20"><span style={{width:`${progress}%`,background:'#a8decf'}}/></div>
   {complete&&<div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5" data-testid="status-simulator-score"><p className="mono text-xs text-[#9bd9cc]">YOUR PRACTICE SCORE</p><b className="display mt-2 block text-4xl">{score} / 3</b><p className="mt-2 text-sm leading-6 text-white/80">{score===3?'You spotted the cues thoughtfully. Keep verifying through trusted channels.':'Each message is a chance to practice. Slow down, then verify independently.'}</p><button className="btn mt-4 bg-white text-[#1c3f3d]" onClick={()=>{setIndex(0);setAnswers([]);setChoice(null);setComplete(false)}} data-testid="button-restart-simulator"><RotateCcw size={15}/>Try again</button></div>}
  </div><div className="p-5 sm:p-8">
   {!complete&&<><div className="rounded-2xl border border-border bg-background p-5 sm:p-6" data-testid={`content-training-message-${index+1}`}><div className="flex items-center gap-3 border-b border-border pb-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary"><FileText size={19}/></span><div><b className="block text-sm">{s.subject}</b><span className="text-xs text-muted-foreground">To: you · Training example</span></div><span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">Fictional</span></div><p className="mt-4 text-xs text-muted-foreground">{s.sender}</p><p className="mt-4 text-sm leading-7">{s.text}</p><div className="mt-5 rounded-xl bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground"><b className="text-foreground">Editorial training art:</b> this mock message is invented and does not represent a live alert, real sender, or real threat.</div></div>
    {!choice?<><p className="mt-5 text-sm font-bold">How does it feel to you?</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{[['suspicious','Looks suspicious'],['legitimate','Looks legitimate'],['unsure','Not sure']].map(([val,label])=><button key={val} className="btn btn-quiet !rounded-xl !px-3 !text-sm" onClick={()=>submit(val)} data-testid={`button-answer-${val}`}>{label}</button>)}</div></>:<div className="mt-5 rounded-2xl border border-primary/30 bg-secondary/60 p-5" data-testid="status-simulator-feedback" aria-live="polite"><p className="eyebrow">{choice===s.safe?'Thoughtful call':'A useful pause'}</p><p className="mt-2 text-sm leading-6">{s.clue}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">No response should require sharing passwords, one-time codes, or financial details in an unexpected message.</p><button className="btn btn-primary mt-4" onClick={next} data-testid="button-next-scenario">{index===scenarios.length-1?'See my summary':'Next example'} <ArrowRight size={15}/></button></div>}</>}
  </div></div>
 </section>;
}
function SafetyCheck() {
 const [answers,setAnswers]=useStored<Record<number,string>>('ds-safety-answers',{});
 const [submitted,setSubmitted]=useState(Object.keys(answers).length===checklist.length);
 const yes=Object.values(answers).filter(a=>a==='Yes').length;
 const recommendations=checklist.map((q,i)=>({q,i,a:answers[i]})).filter(x=>x.a!=='Yes').map(({q,i,a})=>({title:q,tip:a==='No'?[
   'Start with a password manager and change reused passwords, beginning with your email account.',
   'Enable MFA or passkeys for your email and financial accounts first.',
   'Use the device settings or official app store to install pending updates.',
   'Review permissions in device settings and remove extensions you do not recognize.',
   'Choose one important folder and create a separate backup this week.',
   'Choose a second, independently verified contact route before responding.',
   'Use a saved bookmark or type the official domain before signing in.',
   'Find the report or block option in your messaging app.'
 ][i]:'A good next step is to review this habit and choose one change that feels manageable.'}));
 return <PageFrame><div className="shell py-14"><SectionTitle kicker="A private reflection · 8 questions" title="Your safety check, on your terms." description="A short self-report about everyday habits. Answer Yes, No, or Not sure; your responses stay in this browser demo."/><VisualStrip kind="accounts"/>
  <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><section className="panel p-5 sm:p-8" aria-label="Safety check questions">
   <div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">Your checklist</p><p className="mt-1 text-sm text-muted-foreground">{Object.keys(answers).length} of 8 answered</p></div><span className="mono text-xs text-primary">{Math.round(Object.keys(answers).length/8*100)}%</span></div><div className="progress-track mb-6"><span style={{width:`${Object.keys(answers).length/8*100}%`}}/></div>
   <div className="divide-y divide-border">{checklist.map((q,i)=><fieldset key={q} className="py-5"><legend className="mb-3 text-sm font-semibold">{i+1}. {q}</legend><div className="flex flex-wrap gap-2">{['Yes','No','Not sure'].map(value=><button type="button" key={value} className={`btn !min-h-10 !px-4 !text-xs ${answers[i]===value?'btn-primary':'btn-quiet'}`} aria-pressed={answers[i]===value} onClick={()=>{const next={...answers,[i]:value};setAnswers(next);setSubmitted(false)}} data-testid={`safety-answer-${i+1}-${value.toLowerCase().replace(' ','-')}`}>{answers[i]===value&&<Check size={14}/>} {value}</button>)}</div></fieldset>)}</div>
   <div className="mt-5 flex flex-wrap gap-3"><button className="btn btn-primary" onClick={()=>setSubmitted(true)} disabled={Object.keys(answers).length!==checklist.length} data-testid="button-generate-safety-summary">Show my next steps <ArrowRight size={15}/></button><button className="btn btn-quiet" onClick={()=>{setAnswers({});setSubmitted(false)}} data-testid="button-reset-safety">Reset answers</button></div>
  </section><aside className="space-y-4">
    <div className="panel p-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><ShieldCheck size={21}/></span><div><p className="eyebrow">Honest by design</p><b className="text-sm">Self-reported only</b></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">This checklist reflects the answers you choose. It is not a vulnerability scan, malware scan, professional security audit, or guarantee of safety.</p></div>
    {submitted&&Object.keys(answers).length===8&&<div className="panel p-6" data-testid="content-safety-recommendations" aria-live="polite"><p className="eyebrow">Your reflection</p><h2 className="display mt-2 text-2xl font-extrabold">{yes} of 8 habits in place</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{yes>=6?'You have several helpful habits already. Keep them current and focus on one small improvement.':'There is no need to do everything today. Start with one action that helps your most important account.'}</p>{recommendations.length>0?<ul className="mt-5 space-y-4">{recommendations.slice(0,4).map(x=><li key={x.title} className="border-t border-border pt-3"><b className="text-xs">{x.title}</b><p className="mt-1 text-xs leading-5 text-muted-foreground">{x.tip}</p></li>)}</ul>:<p className="mt-4 text-sm text-primary">Your answers show these habits are in place. Revisit them periodically.</p>}</div>}
    <div className="rounded-2xl bg-[#e6f2ee] p-5 dark:bg-[#142a2b]"><p className="eyebrow">Remember</p><p className="mt-2 text-sm leading-6">This page never asks for passwords, OTPs, bank details, recovery phrases, or device unlock codes.</p></div>
  </aside></div>
  <div className="mt-12"><BrowserGuide/></div>
 </div></PageFrame>;
}
function BrowserGuide() {
 const [done,setDone]=useStored<number[]>('ds-browser-check',[]); const [copied,setCopied]=useState(false);
 const copy=async()=>{try{await navigator.clipboard.writeText(browserTips.map((t,i)=>`${done.includes(i)?'[x]':'[ ]'} ${t}`).join('\n'));setCopied(true);window.setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}};
 return <section className="rounded-[28px] bg-[#1c3f3d] p-6 text-white sm:p-9" aria-labelledby="browser-guide-title"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow !text-[#9bd9cc]">Safer browsing guide</p><h2 id="browser-guide-title" className="display mt-2 text-3xl font-extrabold">Ten practical checks.</h2><p className="mt-2 text-sm text-white/70">Small, repeatable steps. Select the ones you have covered.</p></div><button className="btn bg-white/10 text-white" onClick={copy} data-testid="button-copy-browser-checklist"><Copy size={15}/>{copied?'Copied':'Copy checklist'}</button></div>
  <div className="mt-7 grid gap-2 sm:grid-cols-2">{browserTips.map((tip,i)=><button key={tip} onClick={()=>setDone(done.includes(i)?done.filter(n=>n!==i):[...done,i])} aria-pressed={done.includes(i)} className={`flex items-start gap-3 rounded-xl border p-4 text-left text-sm leading-6 transition ${done.includes(i)?'border-[#8dcbbc] bg-white/10':'border-white/15 hover:bg-white/5'}`} data-testid={`browser-tip-${i+1}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${done.includes(i)?'border-[#8dcbbc] bg-[#8dcbbc] text-[#163b38]':'border-white/40'}`}>{done.includes(i)&&<Check size={13}/>}</span>{tip}</button>)}</div>
  <div className="mt-5 flex items-center gap-3"><div className="progress-track flex-1 bg-white/15"><span style={{width:`${done.length/10*100}%`,background:'#9bd9cc'}}/></div><span className="mono text-xs">{done.length}/10</span></div>
 </section>;
}
type Platform = 'checking' | 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';
type UrlReview = { level: 'low' | 'review' | 'high'; title: string; detail: string; signals: string[]; reportUrl?: string };
type LinkScanReport = { uuid:string; level:string; composite:{safetyScore:number;riskLevel:string;goodSignals:number;badSignals:number;totalSignals:number}; page:Record<string,any>; stats:Record<string,any>; verdictDetails:Record<string,any>; network:Record<string,any[]>; assessment:string; caveat:string; reportUrl:string };
type MessageReview = { level: 'low' | 'review' | 'high'; title: string; signals: string[]; links: Array<{ address: string; result: UrlReview }> };
type AiMessageResult = { reply: string; score: number | null; scoreLabel: string };
type NativeScanResult = { status: string; scanned?: number; findings?: Array<{name:string; risk:string; detail:string}>; message?:string };

declare global {
  interface Window {
    median?: {
      deviceInfo?: () => Promise<Record<string, unknown>>;
      permissions?: { status?: (names?: string[]) => Promise<Record<string, string>> };
      onesignal?: { register?: () => unknown };
      webview?: { clearCache?: () => unknown };
      open?: { appSettings?: () => unknown };
    };
    digitalSafetyScanner?: {
      getStatus?: () => Promise<{available:boolean; paused?:boolean; lastScanAt?:string|null; nextScanAt?:string|null; message?:string}>;
      scanInstalledApps?: () => Promise<NativeScanResult>;
      setPaused?: (paused:boolean) => Promise<unknown>;
    };
  }
}

function detectClientPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Linux|X11/i.test(ua)) return 'linux';
  return 'unknown';
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return 'Unavailable';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB','MB','GB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let i=0; i<units.length-1 && value >= 1024; i++) { value /= 1024; unit = units[i+1]; }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;
}

function reviewUrl(input: string): UrlReview {
  let parsed: URL;
  try {
    const cleaned = input.trim();
    if (!cleaned) return {level:'review',title:'Enter a URL to review',detail:'Paste a complete website address. Nothing is sent to a server.',signals:[]};
    parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`);
  } catch {
    return {level:'high',title:'This does not look like a valid website address',detail:'Check for typos and do not open an unfamiliar link just to test it.',signals:['The address could not be parsed']};
  }
  const signals: string[] = [];
  const host = parsed.hostname.toLowerCase();
  if (parsed.protocol !== 'https:') signals.push('It does not use HTTPS. This alone does not prove fraud, but the connection may not be encrypted.');
  if (parsed.username || parsed.password) signals.push('The URL contains embedded username/password text, which is unusual and potentially deceptive.');
  if (host.startsWith('xn--') || host.split('.').some(part => part.startsWith('xn--'))) signals.push('The domain uses an internationalized/punycode label. Verify the spelling carefully.');
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':') && host.includes('[')) signals.push('The host appears to be a raw IP address rather than a typical domain name.');
  if (host.split('.').length >= 5) signals.push('The hostname contains many subdomain levels. Confirm the actual registered domain.');
  if (/(login|verify|signin|secure|wallet|claim|gift|bonus|airdrop|password|account)/i.test(host) && host.split('.').length > 2) signals.push('The hostname uses account/security or prize-related wording. Check the exact domain independently.');
  if (/(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly)$/i.test(host)) signals.push('This is a link-shortening domain, so the final destination is not obvious from the address.');
  if (!signals.length) return {level:'low',title:'No obvious URL red flags found',detail:'This simple local check found no listed warning signs. It has not checked a live reputation database and cannot confirm the site is safe.',signals:['No obvious heuristic indicators detected']};
  const high = signals.some(s => /embedded username|raw IP|could not be parsed/i.test(s));
  return {level:high || signals.length >= 3 ? 'high' : 'review',title:high || signals.length >= 3 ? 'Use strong caution' : 'Review this address carefully',detail:'These are warning signals, not a definitive verdict. Do not enter passwords, payment details, or verification codes until you verify the site through a trusted channel.',signals};
}

function reviewMessageText(input: string): MessageReview {
  const text = input.trim().slice(0, 6000);
  const signals: string[] = [];
  const rules: Array<[RegExp, string]> = [
    [/\b(password|passcode|one[- ]time (?:code|password)|verification code|\botp\b|bank PIN|recovery phrase|CVV)\b/i, 'The message mentions passwords, access codes, financial secrets, or recovery details. Treat requests for these as highly sensitive.'],
    [/\b(urgent|immediately|within \d+ minutes?|last warning|act now|account.{0,35}(?:suspend|close|lock|deactivat))\b/i, 'The wording creates urgency or threatens an account. Verify independently before acting.'],
    [/\b(delivery fee|customs fee|small fee|payment required|pay now|transfer money|send money|unpaid (?:toll|invoice|bill)|claim your refund)\b/i, 'The message pressures you about payment, fees, transfers, or refunds. Check with the organization using its official app or site.'],
    [/\b(you(?:'ve| have) won|claim.{0,35}(?:prize|gift|reward|bonus)|giveaway|airdrop|free iphone|guaranteed profit)\b/i, 'The message uses a prize, giveaway, bonus, or guaranteed-profit claim. Unexpected rewards can be a lure.'],
    [/\b(remote access|screen.?share|install.{0,30}(?:apk|application|app|software)|download.{0,30}(?:installer|apk)|anydesk|teamviewer)\b/i, 'The message mentions software installation or remote access. Only install software from a publisher you independently trust.'],
    [/\b(keep (?:this|it) secret|don't tell anyone|do not tell anyone|gift cards? as payment|crypto wallet)\b/i, 'The message asks for secrecy or an unusual payment method. Verify through a separate trusted channel.']
  ];
  if (!text) signals.push('No message text was provided.');
  for (const [pattern, explanation] of rules) if (pattern.test(text)) signals.push(explanation);
  const candidates = text.match(/(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|co|io|app|dev|info|biz|me|ng|uk|gov|edu)(?:\/[^\s<>"']*)?/gi) || [];
  const urls = [...new Set(candidates.map(value => value.replace(/[),.;!?]+$/, '')))].slice(0, 5);
  const links = urls.map(address => ({ address, result: reviewUrl(address) }));
  if (links.some(link => link.result.level === 'high')) signals.push('At least one included link has multiple or strong URL-format warning signs.');
  else if (links.some(link => link.result.level === 'review')) signals.push('At least one included link has a URL-format warning sign.');
  const level: MessageReview['level'] = signals.length >= 3 || (signals.some(x => /passwords, access codes/i.test(x)) && signals.some(x => /urgency or threatens/i.test(x))) ? 'high' : signals.length ? 'review' : 'low';
  return {
    level,
    title: !text ? 'Paste a message to review' : level === 'high' ? 'Several warning signs found' : level === 'review' ? 'Review this message carefully' : 'No listed warning pattern found',
    signals: signals.length ? signals : ['No listed warning patterns were detected in this text. This is not a live reputation check and cannot prove the sender or message is legitimate.'],
    links
  };
}

const securityArticles = [
  {category:'Links',title:'A URL can look familiar and still be fake',text:'Read the registered domain from right to left. A familiar brand name in a long subdomain does not make the final domain official.',action:'Open important services using a bookmark or the address you already trust.'},
  {category:'Messages',title:'Never share a one-time code with an incoming caller',text:'A caller who knows your name or a few account details has not proved their identity. Verification codes are designed to be kept secret.',action:'Hang up and contact the company using a number from its official website or app.'},
  {category:'Downloads',title:'Treat APK files like software installers',text:'An APK can ask for powerful permissions after installation. File names, logos and claims such as “premium unlocked” do not prove a file is genuine.',action:'Prefer the official developer or trusted app store. Review every permission before granting it.'},
  {category:'Accounts',title:'A breached password should not be reused',text:'Attackers may try exposed passwords on email, social, shopping and financial accounts. Reusing one password expands the damage.',action:'Use unique passwords and enable passkeys or multi-factor authentication.'},
  {category:'Browser',title:'Browser notification pop-ups can be deceptive',text:'A site may ask to send notifications and then push misleading “virus detected” or prize messages. A notification is not a system security scan.',action:'Allow notifications only from sites where you genuinely need them, and revoke suspicious site permissions.'},
  {category:'Devices',title:'Permission requests should match the feature',text:'A flashlight or wallpaper app usually has no obvious reason to read call history, access contacts or monitor all websites.',action:'Review permissions in system settings and remove access that is not needed.'},
  {category:'Wi-Fi',title:'HTTPS is not a trust badge',text:'HTTPS encrypts the connection between you and a domain. Scam sites can also use HTTPS certificates.',action:'Check the domain, why you were sent there, and what the site asks you to do.'},
  {category:'Fraud',title:'Urgency is a common pressure tactic',text:'Fake delivery fees, account closure threats, prize claims and impersonation scams try to stop you thinking clearly.',action:'Pause. Verify the message with the organization through a separate, trusted channel.'},
  {category:'Privacy',title:'Remove apps you no longer use',text:'Unused apps may still have account access, permissions or outdated components. A permission alone is not proof of malware, but unnecessary access increases risk.',action:'Uninstall apps you do not recognize or need, and review permissions for those you keep.'},
  {category:'Recovery',title:'Plan what to do before an incident',text:'A recovery email, current phone number, multi-factor authentication and separate backups can make recovery easier.',action:'Check recovery options while you still have access to the account.'},
  {category:'Support',title:'Fake technical support wants control',text:'A pop-up or caller may claim your device is infected and ask you to install remote-access software. A website warning cannot itself prove your device is infected.',action:'Close the page and use official support channels that you reach independently.'},
  {category:'QR codes',title:'A QR code is still a link',text:'A QR code can lead to a convincing fake sign-in page or payment destination. The fact that it is printed on a poster or message does not verify it.',action:'Preview the destination and verify the domain before signing in or paying.'},
  {category:'Sharing',title:'Check who can open a shared file',text:'Cloud document and file-sharing messages can imitate colleagues or services. Unexpected requests to sign in through a shared link deserve extra scrutiny.',action:'Open the cloud provider directly and locate the document from your own account.'},
  {category:'Payments',title:'Verify payment changes separately',text:'Fraudsters may impersonate a vendor or relative and ask you to change bank details or pay a different account.',action:'Confirm new payment instructions through a second channel you already trust.'},
  {category:'Accounts',title:'Protect account recovery options',text:'An attacker with control of your recovery email or phone may be able to reset other accounts.',action:'Secure recovery accounts with unique credentials and multi-factor authentication.'},
  {category:'Extensions',title:'Review browser add-ons occasionally',text:'Extensions can read or change website data when granted access. An extension that was once useful can later become unnecessary or change ownership.',action:'Remove add-ons you do not use and review publisher details and permissions before installing new ones.'}
];

function DeviceProtection() {
  const [platform,setPlatform] = useState<Platform>('checking');
  const [isNative,setIsNative] = useState(false);
  const [notificationState,setNotificationState] = useState('unknown');
  const [locationState,setLocationState] = useState('not requested');
  const [paused,setPaused] = useState(() => { try { return localStorage.getItem('ds-reminders-paused') === 'true'; } catch { return false; } });
  const [notice,setNotice] = useState('');
  const [storageBytes,setStorageBytes] = useState<number|undefined>();
  const [cacheCount,setCacheCount] = useState<number>(0);
  const [urlInput,setUrlInput] = useState('');
  const [urlResult,setUrlResult] = useState<UrlReview|null>(null);
  const [urlBusy,setUrlBusy] = useState(false);
  const [linkScanReport,setLinkScanReport] = useState<LinkScanReport|null>(null);
  const [publicScanConsent,setPublicScanConsent] = useState(true);
  const [messageText,setMessageText] = useState('');
  const [messageResult,setMessageResult] = useState<MessageReview|null>(null);
  const [aiMessageResult,setAiMessageResult] = useState<AiMessageResult|null>(null);
  const [messageBusy,setMessageBusy] = useState(false);
  const [nativeScanner,setNativeScanner] = useState<{available:boolean;paused?:boolean;lastScanAt?:string|null;nextScanAt?:string|null;message?:string}>({available:false,message:'Native scanner is not connected to this web build.'});
  const [scanResult,setScanResult] = useState<NativeScanResult|null>(null);
  const [scanBusy,setScanBusy] = useState(false);
  const [cleanBusy,setCleanBusy] = useState(false);
  const [showPermissionDetails,setShowPermissionDetails] = useState(false);
  const [articleIndex,setArticleIndex] = useState(0);
  const [showAllArticles,setShowAllArticles] = useState(false);
  const [periodicTip,setPeriodicTip] = useState<typeof securityArticles[number] | null>(null);
  const [platformDetected,setPlatformDetected] = useState(false);

  useEffect(() => {
    let alive = true;
    const base = detectClientPlatform();
    setPlatform(base);
    setIsNative(Boolean(window.median));
    setPlatformDetected(true);
    if ('Notification' in window) setNotificationState(Notification.permission);
    const url = new URL(window.location.href);
    if (url.searchParams.get('pause-reminders') === '1') {
      setPaused(true);
      try { localStorage.setItem('ds-reminders-paused','true'); } catch {}
      url.searchParams.delete('pause-reminders');
      window.history.replaceState({},'',url.toString());
    }
    const onServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PAUSE_REMINDERS') pauseReminders();
    };
    if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', onServiceWorkerMessage);
    const updateStorage = async () => {
      try {
        const estimate = await navigator.storage?.estimate();
        if (alive) setStorageBytes(estimate?.usage);
        if ('caches' in window) {
          const keys = await window.caches.keys();
          if (alive) setCacheCount(keys.filter(k => k.startsWith('digital-safety')).length);
        }
      } catch { /* Storage estimates are optional and browser-dependent. */ }
    };
    void updateStorage();
    const scanner = window.digitalSafetyScanner;
    if (scanner?.getStatus) scanner.getStatus().then(s => alive && setNativeScanner({...s,available: Boolean(s.available)})).catch(() => {});
    // Median can provide reliable device metadata inside its native WebView; no device identifiers are stored.
    if (window.median?.deviceInfo) {
      window.median.deviceInfo().then(info => {
        if (!alive) return;
        setIsNative(true);
        const os = String(info.os || info.platform || '').toLowerCase();
        if (os.includes('android')) setPlatform('android');
        else if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) setPlatform('ios');
      }).catch(() => {});
    }
    return () => {
      alive = false;
      if (navigator.serviceWorker) navigator.serviceWorker.removeEventListener('message', onServiceWorkerMessage);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 12000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (paused || new URLSearchParams(window.location.search).get('pause-reminders') === '1') return;
    try {
      const now = Date.now();
      const last = Number(localStorage.getItem('ds-last-inapp-tip') || 0);
      const eightHours = 8 * 60 * 60 * 1000;
      if (!last || now - last >= eightHours) {
        const slot = Math.floor(now / eightHours) % securityArticles.length;
        setPeriodicTip(securityArticles[slot]);
        localStorage.setItem('ds-last-inapp-tip', String(now));
      }
    } catch { /* Tips remain available manually if local storage is disabled. */ }
  }, [paused]);

  function notify(message:string) { setNotice(message); }
  function pauseReminders() {
    setPaused(true);
    try { localStorage.setItem('ds-reminders-paused','true'); } catch {}
    setNotice('Safety reminders paused. This pauses Digital Safety reminders/checks exposed by this interface; it cannot force-close the operating-system app.');
    const scannerBridge = window.digitalSafetyScanner;
    if (scannerBridge?.setPaused) void scannerBridge.setPaused(true).catch(() => {});
  }
  function resumeReminders() {
    setPaused(false);
    try { localStorage.setItem('ds-reminders-paused','false'); } catch {}
    const scannerBridge = window.digitalSafetyScanner;
    if (scannerBridge?.setPaused) void scannerBridge.setPaused(false).catch(() => {});
    notify('Reminders resumed. Native scanning remains unavailable unless the Android scanner module is installed.');
  }
  async function enableNotifications() {
    try {
      if (window.median?.onesignal?.register) {
        await window.median.onesignal.register();
        setNotificationState('native setup requested');
        notify('Notification registration was requested from Median. Delivery depends on OneSignal/FCM being configured in App Studio.');
        return;
      }
      if (!('Notification' in window)) { notify('This browser does not support web notifications. In-app tips will still work.'); return; }
      let permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      setNotificationState(permission);
      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          await registration.showNotification('Digital Safety notifications enabled', {
            body: 'Security tips are available. Use the notification action to pause reminders. This is not a malware scan.',
            icon: '/favicon.svg', tag: 'digital-safety-welcome',
            actions: [{action:'pause',title:'Stop checks & alerts'},{action:'open',title:'Open dashboard'}]
          } as NotificationOptions);
        } else {
          try { new Notification('Digital Safety notifications enabled', {body:'Security tips are available while this browser session is active.'}); } catch {}
        }
        notify('Notifications are enabled for supported browser alerts. Periodic background delivery is not configured by this website.');
      } else notify(`Notification permission: ${permission}. You can still read security tips inside Digital Safety.`);
    } catch { notify('Could not enable notifications. Check browser or Median app permissions and try again.'); }
  }
  async function requestLocation() {
    if (!navigator.geolocation) { setLocationState('not supported'); notify('Location is not supported here. It is optional and not needed for link checks.'); return; }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      () => { setLocationState('granted for this request'); notify('Location permission was granted. Coordinates were not saved or sent anywhere by this page. Location does not improve malware scanning.'); },
      error => { const message = error.code === 1 ? 'denied' : error.code === 2 ? 'unavailable' : 'timed out'; setLocationState(message); notify(`Location status: ${message}. Digital Safety works without location.`); },
      {enableHighAccuracy:false,timeout:8000,maximumAge:0}
    );
  }
  async function estimateStorage() {
    try {
      const estimate = await navigator.storage?.estimate();
      setStorageBytes(estimate?.usage);
      if ('caches' in window) setCacheCount((await window.caches.keys()).filter(k => k.startsWith('digital-safety')).length);
    } catch { notify('This browser does not expose an origin-storage estimate.'); }
  }
  async function clearOwnedCache() {
    if (!window.confirm('Clear only Digital Safety-owned browser caches? This may require assets to be downloaded again. Saved lessons and theme preferences will be kept.')) return;
    setCleanBusy(true);
    try {
      let cleared = 0;
      if ('caches' in window) {
        const names = await window.caches.keys();
        const owned = names.filter(k => k.startsWith('digital-safety'));
        const results = await Promise.all(owned.map(k => window.caches.delete(k)));
        cleared += results.filter(Boolean).length;
      }
      let medianRequested = false;
      if (window.median?.webview?.clearCache) {
        await window.median.webview.clearCache();
        medianRequested = true;
      }
      await estimateStorage();
      notify(medianRequested
        ? `Requested the Median WebView cache clear and removed ${cleared} Digital Safety-owned Cache Storage item(s). Other apps' caches and the operating system cache were not touched.`
        : `Removed ${cleared} Digital Safety-owned Cache Storage item(s). This browser did not expose a native cache-clear command, so other browser/system caches were not touched.`);
    } catch { notify('The cache clear was not fully available in this environment. Use your browser or device settings for broader cleanup.'); }
    finally { setCleanBusy(false); }
  }
  async function runNativeScan() {
    const scanner = window.digitalSafetyScanner;
    if (!scanner?.scanInstalledApps) { notify('No native scanner is attached. No installed apps were scanned and no result was fabricated. See the Median integration guide.'); return; }
    setScanBusy(true); setScanResult(null);
    try {
      const result = await scanner.scanInstalledApps();
      setScanResult(result);
      if (result.status === 'completed') notify(`Native scan completed. ${result.scanned ?? 'Unknown'} app(s) inspected by the configured scanner.`);
      else notify(result.message || 'The native scanner did not complete a scan.');
      if (scanner.getStatus) setNativeScanner({...await scanner.getStatus(),available:true});
    } catch { notify('The native scan failed to start. No conclusion about device safety can be made.'); }
    finally { setScanBusy(false); }
  }
  async function submitUrl(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const local = reviewUrl(urlInput);
    setUrlResult(local);
    setLinkScanReport(null);
    if (local.title.includes('Enter a URL') || local.title.includes('valid website')) return;
    if (!publicScanConsent) { notify('Please acknowledge that submitted website addresses may be publicly visible.'); return; }
    setUrlBusy(true);
    try {
      const submitted = await fetch('/api/safety/check-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:urlInput,publicScanConsent:true})});
      const start = await submitted.json();
      if (!submitted.ok) throw new Error(start.error || 'Could not submit this link.');
      let report:any=null;
      for(let attempt=0;attempt<18;attempt++){
        await new Promise(resolve=>setTimeout(resolve,5000));
        const response=await fetch(start.resultPath,{cache:'no-store'});
        report=await response.json();
        if(response.status===200 && !report.pending) break;
        if(!response.ok && response.status!==202) throw new Error(report.error || 'Could not retrieve scan results.');
      }
      if(!report || report.pending) throw new Error('The scan is taking longer than expected. Try again later.');
      setLinkScanReport(report as LinkScanReport);
      setUrlResult({level:report.level,title:`${report.composite?.riskLevel || report.verdict} · ${report.composite?.safetyScore ?? '—'}/100`,detail:`Analysis completed for ${report.page?.url || urlInput}`,signals:report.findings || [],reportUrl:report.reportUrl});
    } catch(error) { setUrlResult({...local,level:'review',title:'Live scan unavailable',detail:error instanceof Error?error.message:'Could not complete the scan. Local indicators are shown below.'}); }
    finally { setUrlBusy(false); }
  }
  async function submitMessage(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted=messageText.trim();
    if(!submitted || messageBusy) return;
    setAiMessageResult(null); setMessageResult(null); setMessageBusy(true);
    try {
      const response=await fetch('/api/safety/check-message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:submitted})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || 'Message analysis failed.');
      setAiMessageResult(data);
    } catch(error) { notify(error instanceof Error?error.message:'Could not analyse this message. Please try again.'); }
    finally { setMessageBusy(false); }
  }
  async function showSecurityTip(article:typeof securityArticles[number], index:number) {
    setArticleIndex(index);
    if (paused) { notify('Reminders are paused. Resume them before creating a notification.'); return; }
    notify(`Security tip: ${article.title} — ${article.action}`);
    if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        await registration.showNotification(`Digital Safety tip: ${article.title}`, {
          body: `${article.text} Try this: ${article.action}`,
          icon: '/favicon.svg', tag: `digital-safety-tip-${index}`,
          actions: [{action:'pause',title:'Stop checks & alerts'},{action:'open',title:'Open dashboard'}]
        } as NotificationOptions);
      } catch { /* In-app notice remains visible if system notification delivery is unavailable. */ }
    }
  }
  const platformName = ({checking:'Checking device',android:'Android',ios:'iPhone / iPad',windows:'Windows PC',macos:'Mac',linux:'Linux PC',unknown:'Browser / unknown'} as Record<Platform,string>)[platform];
  const notificationsSupported = typeof Notification !== 'undefined' || Boolean(window.median?.onesignal?.register);
  const visibleArticles = showAllArticles ? securityArticles : securityArticles.slice(0,4);

  return <PageFrame><div className="shell py-10 sm:py-14">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Digital Safety Control Centre</p><h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">Your safety dashboard.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">A free, privacy-first dashboard for link checks, cleaning this site's own cache, permission controls, and security education. Native device scanning is a separate module—not simulated here.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold"><span className={`h-2 w-2 rounded-full ${platformDetected?'bg-emerald-500':'bg-amber-500'}`}/>{platformDetected ? platformName : 'Detecting platform…'}</span></div>

    {notice && <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-primary/40 bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between" role="status"><div className="flex items-start gap-3"><Info className="mt-0.5 shrink-0 text-primary" size={18}/><p className="text-sm leading-6">{notice}</p></div><div className="flex flex-wrap gap-2"><button className="btn btn-quiet !min-h-9 !py-2" onClick={()=>setNotice('')}>Dismiss</button>{!paused&&<button className="btn btn-soft !min-h-9 !py-2 !text-xs" onClick={pauseReminders}><PauseCircle size={14}/>Stop checks & alerts</button>}</div></div>}
    {periodicTip && !paused && <div className="mb-5 rounded-2xl border border-primary/30 bg-primary/5 p-4" role="note"><div className="flex flex-wrap items-start justify-between gap-3"><div className="max-w-3xl"><p className="eyebrow">An occasional safety note · shown when you open the dashboard</p><h2 className="display mt-1 text-lg font-bold">{periodicTip.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{periodicTip.text} <strong>Try this:</strong> {periodicTip.action}</p></div><button className="btn btn-quiet !min-h-9 !py-2 !text-xs" onClick={()=>setPeriodicTip(null)}>Mark as read</button></div></div>}

    <div className="grid gap-4 lg:grid-cols-[1.45fr_.8fr]">
      <section className="cyber-panel p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary"><ShieldCheck size={26}/></span><div><p className="eyebrow">Status overview</p><h2 className="display mt-1 text-2xl font-extrabold">Protection readiness</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{isNative ? 'Median native wrapper detected.' : 'Browser view detected.'} The view was adapted to your platform; this does not optimize device performance or mean a malware scan has run.</p></div></div><span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">Scanner not connected</span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/70 p-4"><Link2 size={20} className="text-primary"/><p className="mt-3 text-sm font-bold">Link risk review</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Available now · local heuristics</p></div>
          <div className="rounded-2xl border border-border bg-card/70 p-4"><Package size={20} className="text-primary"/><p className="mt-3 text-sm font-bold">Installed-app scan</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Needs a native scanner</p></div>
          <div className="rounded-2xl border border-border bg-card/70 p-4"><RefreshCw size={20} className="text-primary"/><p className="mt-3 text-sm font-bold">8-hour schedule</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Not active until native integration</p></div>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><AlertCircleIcon/><div><b className="text-sm">Native scanner status</b><p className="mt-1 text-xs leading-5 text-muted-foreground">{nativeScanner.available ? (nativeScanner.message || 'Scanner bridge is available. Scan only runs after you start it.') : 'No native scanner bridge was found. This page cannot inspect installed apps, system files, or background processes.'}</p>{nativeScanner.lastScanAt && <p className="mt-2 text-xs text-muted-foreground">Last reported scan: {new Date(nativeScanner.lastScanAt).toLocaleString()}</p>}</div></div><button className="btn btn-soft !min-h-10 !px-3 !text-xs" disabled={!nativeScanner.available || scanBusy || paused} onClick={()=>void runNativeScan()}>{scanBusy?<LoaderCircle className="animate-spin" size={15}/>:<Shield size={15}/>} {scanBusy?'Scanning…':'Run native scan'}</button></div>
          {!nativeScanner.available && <p className="mt-3 text-xs text-muted-foreground">The scan button stays disabled until a real native scanner is included in the Median build. No dummy scan results are displayed.</p>}
          {scanResult && <div className="mt-4 rounded-xl bg-secondary/60 p-4"><p className="text-sm font-bold">{scanResult.status === 'completed' ? 'Native scan result' : 'Scanner response'}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{scanResult.message || `${scanResult.scanned ?? 'Unknown'} item(s) were inspected by the configured native scanner.`}</p>{scanResult.findings?.map((finding,i)=><div className="mt-2 rounded-lg border border-border p-3" key={`${finding.name}-${i}`}><b className="text-sm">{finding.name}</b><span className="ml-2 text-xs text-amber-600">{finding.risk}</span><p className="mt-1 text-xs text-muted-foreground">{finding.detail}</p></div>)}</div>}
        </div>
      </section>

      <section className="panel p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Run state</p><h2 className="display mt-1 text-xl font-extrabold">{paused?'Reminders paused':'Safety reminders active'}</h2></div>{paused?<PauseCircle className="text-amber-500" size={25}/>:<Activity className="text-primary" size={25}/>}</div><p className="mt-3 text-sm leading-6 text-muted-foreground">{paused?'Digital Safety tips and exposed scanner checks are paused.':'The dashboard is ready. Background scanning is unavailable until a native module is connected.'}</p><button className={`btn mt-5 w-full ${paused?'btn-primary':'btn-quiet'}`} onClick={paused?resumeReminders:pauseReminders}>{paused?<PlayCircle size={16}/>:<PauseCircle size={16}/>} {paused?'Resume reminders':'Stop checks & alerts'}</button><p className="mt-3 text-xs leading-5 text-muted-foreground">This pauses the features Digital Safety controls. A webpage cannot force-close Android or Windows, and this control is not an operating-system kill switch.</p><div className="mt-5 flex flex-col gap-2 border-t border-border pt-4"><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Platform</span><b>{platformName}</b></div><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Native container</span><b>{isNative?'Median detected':'Not detected'}</b></div><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Protection cost</span><b>Free preview</b></div></div></section>
    </div>

    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      <article className="panel p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Search size={23}/></span><div><p className="eyebrow">On-device · no upload</p><h2 className="display mt-1 text-2xl font-extrabold">Check a suspicious link</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Submits your link for live reputation and page analysis. Submitted addresses may be publicly visible.</p></div></div>
        <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={publicScanConsent} onChange={e=>setPublicScanConsent(e.target.checked)} className="mt-1"/> I understand that submitted website addresses and scan information may be publicly accessible.</label><form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={submitUrl}><label className="sr-only" htmlFor="url-risk-input">Website address to review</label><input id="url-risk-input" className="field min-w-0 flex-1" type="text" inputMode="url" autoComplete="url" placeholder="https://example.com" value={urlInput} onChange={e=>setUrlInput(e.target.value)} maxLength={2048}/><button className="btn btn-primary shrink-0" type="submit" disabled={urlBusy}>{urlBusy?<LoaderCircle className="animate-spin" size={16}/>:<Search size={16}/>} {urlBusy?"Submitting & scanning…":"Scan link"}</button></form>
        {urlResult && <div className={`mt-4 rounded-2xl border p-4 ${urlResult.level==='high'?'border-red-500/40 bg-red-500/5':urlResult.level==='review'?'border-amber-500/40 bg-amber-500/5':'border-emerald-500/40 bg-emerald-500/5'}`} role="status">
          {!linkScanReport ? <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5" size={21}/><div><b className="text-sm">{urlResult.title}</b><p className="mt-1 text-xs leading-5 text-muted-foreground">{urlResult.detail}</p><ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5">{urlResult.signals.map(signal=><li key={signal}>{signal}</li>)}</ul></div></div> :
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Website security report</p><h3 className="display mt-1 text-xl font-extrabold">Scan completed</h3><p className="mt-1 break-all text-xs text-muted-foreground">Report ID: {linkScanReport.uuid}</p></div><a className="btn btn-quiet !min-h-9 !text-xs" href={linkScanReport.reportUrl} target="_blank" rel="noreferrer">Open full report <ExternalLink size={13}/></a></div>
            <div className="rounded-xl border border-border bg-card p-4"><p className="eyebrow">Composite safety score</p><div className="mt-2 flex flex-wrap items-baseline justify-between gap-2"><strong className="display text-4xl font-extrabold">{linkScanReport.composite.safetyScore}<span className="text-lg text-muted-foreground"> / 100</span></strong><span className="rounded-full bg-secondary px-3 py-1 text-xs font-extrabold">{linkScanReport.composite.riskLevel}</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">{[['Good signals',linkScanReport.composite.goodSignals],['Bad signals',linkScanReport.composite.badSignals],['Total signals',linkScanReport.composite.totalSignals]].map(([label,value])=><div key={label} className="rounded-lg bg-secondary/70 p-2"><b className="block text-lg">{value}</b><span className="text-muted-foreground">{label}</span></div>)}</div></div>
            <div><h4 className="font-bold text-sm">📋 Signal breakdown</h4><div className="mt-2 divide-y divide-border rounded-xl border border-border bg-card text-xs">
              <div className="flex justify-between gap-3 p-3"><span>ML score</span><b>{linkScanReport.verdictDetails.urlscan?.score ?? '—'} · {linkScanReport.verdictDetails.urlscan?.hasVerdicts ? 'Verdicts available':'No verdict'}</b></div>
              <div className="flex justify-between gap-3 p-3"><span>Antivirus engines</span><b>{linkScanReport.verdictDetails.engines.flagged} flagged / {linkScanReport.verdictDetails.engines.total} total</b></div>
              {linkScanReport.verdictDetails.engines.results.filter((e:any)=>e.malicious).map((e:any,i:number)=><div key={i} className="p-3 text-red-600">{e.enginename || e.name || 'Security engine'}: {e.result || 'Flagged'}</div>)}
              <div className="flex justify-between gap-3 p-3"><span>Community score</span><b>{linkScanReport.verdictDetails.community?.score ?? '—'}</b></div>
              <div className="flex justify-between gap-3 p-3"><span>Malicious requests</span><b>{linkScanReport.stats.malicious}</b></div>
              <div className="flex justify-between gap-3 p-3"><span>Secure percentage</span><b>{linkScanReport.stats.securePercentage}%</b></div>
              <div className="flex justify-between gap-3 p-3"><span>Umbrella rank</span><b>{linkScanReport.page.umbrellaRank || 'Not ranked'}</b></div>
            </div></div>
            <div><h4 className="font-bold text-sm">🌐 Page information</h4><div className="mt-2 grid gap-2 rounded-xl border border-border bg-card p-3 text-xs sm:grid-cols-2">{([['URL',linkScanReport.page.url],['Title',linkScanReport.page.title],['IP / Country',[linkScanReport.page.ip,linkScanReport.page.country].filter(Boolean).join(' / ')],['ASN',[linkScanReport.page.asn,linkScanReport.page.asnname].filter(Boolean).join(' · ')],['Server',linkScanReport.page.server],['HTTP status',linkScanReport.page.status],['MIME type',linkScanReport.page.mimeType],['TLS issuer',linkScanReport.page.tlsIssuer],['TLS age (days)',linkScanReport.page.tlsAgeDays]] as [string,any][]).map(([label,value])=><div key={label} className="min-w-0"><span className="text-muted-foreground">{label}</span><p className="mt-1 break-all font-semibold">{value ?? '—'}</p></div>)}</div></div>
            <div><h4 className="font-bold text-sm">📊 Network statistics</h4><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{([['Requests',linkScanReport.stats.requests],['Unique IPs',linkScanReport.stats.uniqueIPs],['Unique domains',linkScanReport.stats.uniqueDomains],['Unique countries',linkScanReport.stats.uniqueCountries],['Data size (MB)',linkScanReport.stats.dataSizeMB],['Total links',linkScanReport.stats.totalLinks]] as [string,any][]).map(([label,value])=><div key={label} className="rounded-lg border border-border bg-card p-3"><b className="display block text-lg">{value ?? '—'}</b><span className="text-[11px] text-muted-foreground">{label}</span></div>)}</div></div>
            <div><h4 className="font-bold text-sm">🖥️ Servers</h4><div className="mt-2 rounded-xl border border-border bg-card p-3 text-xs">{linkScanReport.stats.serverStats.length ? linkScanReport.stats.serverStats.map((server:any,i:number)=><div key={i} className="flex justify-between gap-3 py-1"><span>{server.server || 'Unknown server'}</span><b>{server.count ?? 0} requests</b></div>) : 'No server breakdown returned.'}</div></div>
            <div><h4 className="font-bold text-sm">Network inventory</h4><div className="mt-2 grid gap-2 sm:grid-cols-3">{([['IP addresses',linkScanReport.network.ips],['Domains',linkScanReport.network.domains],['Countries',linkScanReport.network.countries]] as [string,any[]][]).map(([label,items])=><details key={label} className="rounded-xl border border-border bg-card p-3"><summary className="cursor-pointer text-xs font-bold">{label} ({items.length})</summary><ul className="mt-2 max-h-40 space-y-1 overflow-auto break-all text-[11px] text-muted-foreground">{items.map((item:any,i:number)=><li key={i}>{typeof item==='string'?item:JSON.stringify(item)}</li>)}</ul></details>)}</div></div>
            <details className="rounded-xl border border-border bg-card p-3"><summary className="cursor-pointer text-xs font-bold">Individual network requests ({linkScanReport.network.requests.length})</summary><div className="mt-2 max-h-64 space-y-2 overflow-auto">{linkScanReport.network.requests.map((request:any,i:number)=><pre key={i} className="overflow-auto whitespace-pre-wrap break-all rounded-lg bg-secondary/60 p-2 text-[10px] leading-4">{JSON.stringify(request,null,2)}</pre>)}</div></details>
            <div className="rounded-xl border border-border bg-card p-4"><h4 className="font-bold text-sm">🛡️ Final security assessment</h4><p className="mt-2 text-sm leading-6">{linkScanReport.assessment}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{linkScanReport.caveat}</p></div>
          </div>}
        </div>}
        <button className="mt-4 text-xs font-bold text-primary underline underline-offset-4" onClick={()=>{setUrlInput(window.location.origin);setUrlResult(reviewUrl(window.location.origin));}}>Check current Digital Safety domain</button>
      </article>
      <article className="panel p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Trash2 size={23}/></span><div><p className="eyebrow">Origin-only cleanup</p><h2 className="display mt-1 text-2xl font-extrabold">Storage & cache cleaner</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Estimates this website's origin storage, and clears only its own named browser caches. In a configured Median Android WebView, it can also request the native WebView cache clear.</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-secondary/70 p-4"><p className="text-xs text-muted-foreground">Origin storage estimate</p><b className="display mt-1 block text-2xl">{formatBytes(storageBytes)}</b></div><div className="rounded-xl bg-secondary/70 p-4"><p className="text-xs text-muted-foreground">Owned Cache Storage</p><b className="display mt-1 block text-2xl">{cacheCount} {cacheCount===1?'cache':'caches'}</b></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-soft !text-xs" onClick={()=>void estimateStorage()}><Gauge size={15}/> Estimate storage</button><button className="btn btn-primary !text-xs" disabled={cleanBusy} onClick={()=>void clearOwnedCache()}>{cleanBusy?<LoaderCircle className="animate-spin" size={15}/>:<Trash2 size={15}/>} {cleanBusy?'Cleaning…':'Clear owned caches'}</button></div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">This cannot clear other apps' caches, the entire browser cache, Windows junk files, or Android system storage. It keeps saved lessons and theme preferences.</p>
      </article>
    </section>

    <section className="mt-6 panel p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldAlert size={23}/></span><div><p className="eyebrow">Scam Guardian · DEVZIKKY AI</p><h2 className="display mt-1 text-2xl font-extrabold">Review a suspicious message</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Paste a suspicious SMS, email, or message. DEVZIKKY AI will assess scam and phishing indicators. Your submitted text is sent to the configured AI service for analysis; remove private details first.</p></div></div>
      <form className="mt-5 grid gap-3" onSubmit={submitMessage}><label className="sr-only" htmlFor="message-risk-input">Suspicious message text</label><textarea id="message-risk-input" className="field min-h-32 w-full resize-y" rows={5} maxLength={6000} placeholder="Paste message text here. Remove private details first." value={messageText} onChange={e=>setMessageText(e.target.value)} required/><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{messageText.length}/6000 characters · AI analysis</p><div className="flex flex-wrap gap-2"><button type="button" className="btn btn-quiet !text-xs" onClick={()=>{setMessageText('');setAiMessageResult(null);setMessageResult(null);}}>Clear</button><button type="submit" disabled={messageBusy || !messageText.trim()} className="btn btn-primary !text-xs">{messageBusy?<LoaderCircle className="animate-spin" size={15}/>:<Sparkles size={15}/>} {messageBusy?'Analyzing…':'Analyze message'}</button></div></div></form>
      {messageBusy && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border p-4" role="status"><Sparkles size={19} className="text-primary"/><div><b className="text-sm">DEVZIKKY AI is thinking</b><div className="mt-2 flex gap-1"><span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-.2s]"/><span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-.1s]"/><span className="h-2 w-2 animate-bounce rounded-full bg-primary"/></div></div></div>}
      {aiMessageResult && <div className="mt-5 flex justify-start"><article className="w-full max-w-3xl rounded-2xl border border-border bg-card p-4 sm:p-5" role="status"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Sparkles size={17} className="text-primary"/><b className="text-sm">DEVZIKKY AI</b></div><button type="button" className="btn btn-quiet !min-h-9 !text-xs" onClick={()=>{void navigator.clipboard?.writeText(aiMessageResult.reply);notify('AI response copied.');}}><Copy size={14}/> Copy response</button></div>{aiMessageResult.score !== null && <div className="mt-4"><div className="flex items-baseline gap-2"><strong className="display text-3xl font-extrabold">{aiMessageResult.score}%</strong><span className="text-xs font-bold text-muted-foreground">{aiMessageResult.scoreLabel}</span></div><p className="mt-1 text-[11px] text-muted-foreground">AI-estimated safety indicator, not a guarantee.</p></div>}<p className="mt-4 whitespace-pre-wrap text-sm leading-7">{aiMessageResult.reply}</p></article></div>}
    </section>

    <section className="mt-6 panel p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Permissions centre</p><h2 className="display mt-1 text-2xl font-extrabold">Your device, your choice.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">No permission is requested when this page opens. Enable something only after reviewing why it is needed. Contacts, call logs, microphone, Wi-Fi and VPN permissions are intentionally not requested.</p></div><button className="btn btn-quiet !text-xs" onClick={()=>setShowPermissionDetails(!showPermissionDetails)}><CircleHelp size={15}/>{showPermissionDetails?'Hide permission details':'Why these permissions?'}</button></div>
      {showPermissionDetails && <div className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm leading-6"><b>Notifications</b> may display optional safety tips. Browser notifications need explicit consent; persistent push in the Median APK additionally needs the OneSignal/FCM setup. <b className="ml-1">Location</b> is optional and not needed to scan links or apps. The page does not save or transmit coordinates. It is included only as an explicitly initiated permission test, not as a scan requirement.</div>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Bell size={18} className="text-primary"/><b className="text-sm">Notifications</b></div><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold">{notificationState}</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Optional alerts and security tips. Every Digital Safety alert includes a pause-reminders action where platform support allows it.</p><button className="btn btn-soft mt-4 !min-h-10 w-full !text-xs" disabled={paused || !notificationsSupported} onClick={()=>void enableNotifications()}><Bell size={15}/>{notificationState==='granted'?'Send a test notification':'Enable notifications'}</button></div>
        <div className="rounded-2xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><MapPin size={18} className="text-primary"/><b className="text-sm">Location</b></div><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold">{locationState}</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Optional. Not needed for protection. A location prompt is shown only when you choose this button; no coordinates are stored or uploaded.</p><button className="btn btn-soft mt-4 !min-h-10 w-full !text-xs" onClick={()=>void requestLocation()}><MapPin size={15}/>Request optional location</button></div>
      </div>
      <div className="mt-4 rounded-xl border border-border/80 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-primary" size={18}/><div><b className="text-sm">No contact, call-log, VPN or Wi-Fi permission</b><p className="mt-1 text-xs leading-5 text-muted-foreground">These are deliberately excluded from this free version. Caller-ID protection would require a separate native feature and a reputable spam intelligence source; call-log access is sensitive and policy-restricted.</p></div></div></div>
    </section>

    <section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Learn a little, often</p><h2 className="display mt-2 text-3xl font-extrabold">Security briefings</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Short, practical reminders about scams and device safety. These are education cards—not warnings generated by a device scan.</p></div><button className="btn btn-soft !text-xs" onClick={()=>setShowAllArticles(!showAllArticles)}>{showAllArticles?'Show fewer':'View all tips'} <ArrowRight size={15}/></button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{visibleArticles.map((article,index)=><article className="panel flex flex-col p-5" key={article.title}><div className="flex items-center justify-between gap-2"><span className="eyebrow">{article.category}</span><span className="mono text-[10px] text-muted-foreground">TIP {String(index+1).padStart(2,'0')}</span></div><h3 className="display mt-3 text-lg font-bold">{article.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{article.text}</p><div className="mt-4 rounded-xl bg-secondary/70 p-3"><b className="text-[11px]">Try this</b><p className="mt-1 text-xs leading-5 text-muted-foreground">{article.action}</p></div><button className="mt-4 self-start text-xs font-bold text-primary underline underline-offset-4" onClick={()=>void showSecurityTip(article,index)}>Show as reminder</button></article>)}</div>
    </section>

    <section className="mt-10 grid gap-4 md:grid-cols-2"><article className="panel p-5 sm:p-6"><div className="flex items-center gap-3"><Smartphone size={22} className="text-primary"/><h2 className="display text-xl font-extrabold">Android app readiness</h2></div><p className="mt-3 text-sm leading-6 text-muted-foreground">The Median APK can host this mobile-friendly website and request supported native permissions. A real installed-app scanner still needs native code, a threat-detection source, scheduling, and tests on a real device.</p><Link className="btn btn-primary mt-4" href="/install/android"><Download size={16}/> Android install instructions <ArrowRight size={15}/></Link></article><article className="panel p-5 sm:p-6"><div className="flex items-center gap-3"><Monitor size={22} className="text-primary"/><h2 className="display text-xl font-extrabold">PC / laptop browser check</h2></div><p className="mt-3 text-sm leading-6 text-muted-foreground">The extension preview can inspect the current page URL and link patterns after you click it. It does not scan Windows/macOS programs or replace endpoint security software.</p><Link className="btn btn-soft mt-4" href="/install/desktop"><Download size={16}/> Browser extension setup <ArrowRight size={15}/></Link></article></section>
    <section className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5"><div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 shrink-0 text-amber-500" size={20}/><div><b className="text-sm">What this dashboard is not</b><p className="mt-1 text-sm leading-6 text-muted-foreground">It is not currently a full antivirus engine. A URL check cannot prove a page safe; a browser cannot list all installed apps; and periodic background scans require native implementation. Use built-in platform security and trusted security software until that work is completed. See <Link className="font-bold text-primary underline" href="/pros-cons">Pros & Cons and feature limits</Link>.</p></div></div></section>
  </div></PageFrame>;
}

function AlertCircleIcon() { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><TriangleAlert size={19}/></span>; }

function ProsCons() {
 const data = [
  ['Included in this web build',true,'Local URL-format checks, security education, browser origin-storage estimates, clearing named app-owned Cache Storage, optional notification/location prompts, responsive platform-specific install guidance.'],
  ['Free to use',true,'The web dashboard and the included browser extension source are free. The extension does not send browsing history to a service.'],
  ['Privacy-first defaults',true,'No contact access, call-log access, VPN, Wi-Fi permissions, app lock, account creation or password collection. Optional permissions are initiated by the user.'],
  ['Actual antivirus scan of installed apps',false,'Not active. This requires a real native Android scanner, package visibility configuration, threat-intelligence/signature updates, and a tested remediation workflow.'],
  ['Guaranteed eight-hour background scans',false,'Not active in the website. Android needs a native scheduler and scan worker; the operating system may defer periodic work.'],
  ['Whole-device cleaner',false,'Not available. The browser can clear only this origin’s managed caches; Median can clear its WebView cache, not all other apps’ caches.'],
  ['Caller-ID or call-log inspection',false,'Not included. Call-log/SMS permissions are sensitive and usually restricted to eligible default phone/SMS/assistant roles or approved exceptions.'],
  ['Full Windows/macOS antivirus',false,'Not included. The extension is a user-triggered URL/link-pattern helper, not a desktop malware scanner or firewall.'],
  ['Live global threat reputation / VPN',false,'Not included. There is no reputation API, threat-feed backend, VPN tunnel, or remote scan service.'],
 ];
 return <PageFrame><div className="shell py-14"><SectionTitle kicker="Transparency centre" title="Pros, cons & honest limits." description="Digital Safety is being built as a free, multi-platform security companion. This page states what is included now and what still requires native engineering or external security services."/><div className="grid gap-4 md:grid-cols-2"><section className="panel p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={24}/></span><div><h2 className="display text-2xl font-extrabold">Pros</h2><p className="text-xs text-muted-foreground">Strengths of the current version</p></div></div><ul className="mt-5 space-y-3">{data.filter(x=>x[1]).map(([title,_,detail])=><li className="flex gap-3" key={String(title)}><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17}/><div><b className="text-sm">{String(title)}</b><p className="mt-1 text-sm leading-6 text-muted-foreground">{String(detail)}</p></div></li>)}</ul></section><section className="panel p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-amber-600"><TriangleAlert size={24}/></span><div><h2 className="display text-2xl font-extrabold">Cons / limitations</h2><p className="text-xs text-muted-foreground">What is not ready yet</p></div></div><ul className="mt-5 space-y-3">{data.filter(x=>!x[1]).map(([title,_,detail])=><li className="flex gap-3" key={String(title)}><TriangleAlert className="mt-0.5 shrink-0 text-amber-600" size={17}/><div><b className="text-sm">{String(title)}</b><p className="mt-1 text-sm leading-6 text-muted-foreground">{String(detail)}</p></div></li>)}</ul></section></div><div className="mt-6 panel p-5 sm:p-7"><h2 className="display text-2xl font-extrabold">Feature availability by platform</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="p-3">Capability</th><th className="p-3">Web browser</th><th className="p-3">Median Android</th><th className="p-3">PC extension</th><th className="p-3">iPhone</th></tr></thead><tbody>{[['Education and tips','Available','Available','Available','Coming later'],['User-triggered URL heuristic','Available','Available in web view','Available','Coming later'],['Pasted SMS/email scam-pattern review','Available locally','Available in web view','Not in extension popup','Coming later'],['Occasional in-app safety note','When dashboard opened after 8 hours','When dashboard opened after 8 hours','Manual only','Coming later'],['Current origin cache cleanup','Limited','WebView cache if configured','Not applicable','Limited'],['Installed app malware scan','No','Native module required','No','No'],['Eight-hour background scan','No','Native scheduler required','No','No'],['Call log analysis','No','Excluded','No','No'],['VPN','No','No','No','No']].map(row=><tr className="border-b border-border last:border-0" key={row[0]}>{row.map((cell,i)=><td className={`p-3 ${i===0?'font-semibold':''}`} key={cell}>{cell}</td>)}</tr>)}</tbody></table></div><p className="mt-4 text-xs leading-5 text-muted-foreground">A feature labelled “available” means the web tool in this project exists; it is not a guarantee that an address or file is safe.</p></div><div className="mt-6 flex flex-wrap gap-3"><Link className="btn btn-primary" href="/device-protection"><ShieldCheck size={16}/> Back to dashboard</Link><Link className="btn btn-soft" href="/privacy"><LockKeyhole size={16}/> Privacy & controls</Link></div></div></PageFrame>;
}

const ANDROID_APK_URL = '';
const ANDROID_APK_PLACEHOLDER = 'https://downloads.example.invalid/digital-safety.apk';
function InstallAndroid() {
 const apkUrl = ANDROID_APK_URL || (import.meta.env.VITE_ANDROID_APK_URL as string | undefined) || '';
 return <PageFrame><div className="shell max-w-3xl py-14"><SectionTitle kicker="Android installation" title="Digital Safety for Android." description="Use the website as an installable home-screen app today, or build the supplied native WebView project for a standalone Android APK. Neither option claims device-wide malware scanning."/><div className="grid gap-4"><section className="panel p-5 sm:p-7"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Smartphone size={27}/></span><div><h2 className="display text-xl font-extrabold">Install the website on Android</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Open this site in Chrome, tap the browser menu, then choose <b>Add to Home screen</b> or <b>Install app</b> when offered. This creates a website shortcut/PWA; it is not the native APK and does not scan installed apps.</p><p className="mt-3 text-xs leading-5 text-muted-foreground">The site includes web manifest and same-origin service worker for supported browsers. Browser support,, and install wording vary by Android Version (6+)</p></div></div></section><section className="panel p-5 sm:p-7"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Download size={27}/></span><div><h2 className="display text-xl font-extrabold">Separate Android APK</h2>{apkUrl?<><p className="mt-2 text-sm leading-6 text-muted-foreground">✍️ Download the published APK online 🗣️</p><a className="btn btn-primary mt-4" href={apkUrl} download><Download size={16}/> Download Android APK</a></>:<><p className="mt-2 text-sm leading-6 text-muted-foreground">No tested APK is published yet. The exact placeholder URL is <code>{ANDROID_APK_PLACEHOLDER}</code>; it is intentionally not clickable and does not claim that an APK exists.</p><button className="btn btn-soft mt-4" disabled><Download size={16}/> APK not published</button></>}</div></div><p className="mt-5 text-xs leading-5 text-muted-foreground">🔰 To download the apk, tap <code>the download button</code> 🔰</p></section></div><div className="mt-6 rounded-xl bg-secondary/60 p-4"><b className="text-sm">Native-app limitations</b><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground"><li>The supplied native wrapper loads the HTTPS dashboard and does not request contacts, call logs, microphone, camera, VPN, Wi-Fi, location, or file access.</li><li>Android back navigation stays inside the website when possible and exits the activity at the root.</li><li>Offline/error states explain that the dashboard could not be loaded; no fake scan result is generated.</li><li>Until a separately implemented and tested native scanner exists, use Android's built-in security checks. The dashboard does not scan installed apps.</li></ol></div></div></PageFrame>;
}
function InstallDesktop() {
 return <PageFrame><div className="shell max-w-3xl py-14"><SectionTitle kicker="PC & laptop setup" title="Add the Digital Safety browser helper." description="The included extension runs locally in a compatible Chromium browser and checks the current tab only when you click its toolbar button. It is a lightweight link-risk helper—not PC antivirus."/><div className="panel p-5 sm:p-7"><div className="flex items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Monitor size={27}/></span><div className="flex-1"><h2 className="display text-xl font-extrabold">Download the extension package</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">The ZIP contains a Manifest V3 browser extension. Until it is published in an official extension store, it must be installed manually in developer mode.</p><a className="btn btn-primary mt-4" href="/downloads/digitalsafety-browser-extension.zip" download><Download size={16}/> Download extension ZIP</a></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-secondary/60 p-4"><h3 className="font-bold">Google Chrome</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground"><li>Extract the downloaded ZIP to a folder you can find again.</li><li>Open <code>chrome://extensions</code>.</li><li>Turn on Developer mode.</li><li>Select “Load unpacked” and choose the extracted `browser-extension` folder.</li><li>Pin Digital Safety, open a website and click the extension to review its URL and visible links.</li></ol></div><div className="rounded-xl bg-secondary/60 p-4"><h3 className="font-bold">Microsoft Edge</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground"><li>Extract the downloaded ZIP.</li><li>Open <code>edge://extensions</code>.</li><li>Enable Developer mode.</li><li>Select “Load unpacked” and choose the extracted folder.</li><li>Pin the extension and click it only when you want to review the current page.</li></ol></div></div><div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><b className="text-sm">Why isn't this one-click yet?</b><p className="mt-1 text-sm leading-6 text-muted-foreground">A website cannot silently install a browser extension. A one-click store install requires publishing and review in the relevant official extension store. The ZIP does not bypass those browser security controls.</p></div><p className="mt-4 text-xs leading-5 text-muted-foreground">🫂 The extension package Is still in review 🤞.</p></div></div></PageFrame>;
}

const faqItems=[
 ['Is Digital Safety a real antivirus product?','Not yet as a full antivirus. The website includes local URL-pattern checks and security education; it does not yet include a native malware-scanning engine or live threat reputation service.'],
 ['Does it scan my phone or computer?','It does not run a device-wide scan. The website can review a URL using local heuristic rules and clear its own managed caches. Installed-app scanning requires a native Android module; the PC extension reviews the current browser page only when you click it.'],
 ['Can it remove malware?','No. The site cannot detect or remove malware. If you suspect an infection, use trusted security software and seek qualified assistance when needed.'],
 ['Does it collect my passwords?','No. The project does not ask for passwords, one-time codes, banking details, recovery phrases, or device unlock codes.'],
 ['What should I do if I clicked a suspicious link?','Stop interacting. If you entered credentials, change them through the official service from a trusted device and review active sessions. Contact your bank or service through independently verified channels if information or money was involved.'],
 ['How can I recognize a fake website?','Check the exact domain, the reason you were sent there, and whether the request is expected. A logo or HTTPS connection alone does not prove legitimacy.'],
 ['Is HTTPS enough to prove a website is safe?','No. HTTPS encrypts the connection to a domain; it does not verify that the site itself is trustworthy.'],
 ['When will full device scanning become available?','No launch date is promised. A real scanner needs native Android implementation, a maintained detection source, background scheduling, threat-remediation safeguards, and real-device tests.']
];
function Privacy() {
 const [open,setOpen]=useState<number|null>(0); const [notice,setNotice]=useState('');
 const reset=()=>{['ds-learned','ds-bookmarks','ds-safety-answers','ds-browser-check','ds-last-inapp-tip'].forEach(k=>localStorage.removeItem(k));setNotice('Local progress and saved lessons were reset. Theme preference was kept.');window.setTimeout(()=>setNotice(''),4000)};
 return <PageFrame><div className="shell py-14"><SectionTitle kicker="Privacy & ethics" title="Trust is a product decision." description="Clear boundaries make safer learning possible. Here is what this project does, what it does not do, and how to respond if something feels wrong."/><VisualStrip kind="privacy"/>
  <section className="grid gap-4 md:grid-cols-2">{[
   ['Data minimization','The site never asks for an account, passwords, OTPs, or financial details. It does not request permissions on page load. Notifications and location are optional and only requested after the user taps their respective controls.'],
   ['Consent & transparency','Selections and progress are handled locally in this frontend. URLs and pasted message text are checked locally and are not uploaded by these review tools. There is no device-wide scanner or background malware monitoring in the web build.'],
   ['Ethical security research','Only test systems and accounts you own or have explicit permission to assess. Respect other people’s privacy and access.'],
   ['Responsible disclosure','If you find a vulnerability, report it through the system owner’s published process. Avoid accessing, changing, or sharing other people’s data.'],
   ['Education, not protection','Reading a guide or completing this checklist does not secure a device. No live scan, detection, remediation, or safety guarantee occurs.'],
   ['Optional permissions','Location is optional and not needed for link checks. If granted, this page ignores the returned coordinates and does not save or transmit them. Browser notification support varies by platform; background push needs extra setup in a packaged app.']
  ].map(([title,body],i)=><article className="panel p-6" key={title}><span className="mono text-xs text-primary">0{i+1} / PRINCIPLE</span><h2 className="display mt-3 text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></article>)}</section>
  <section className="mt-10 rounded-[28px] bg-[#1c3f3d] p-6 text-white sm:p-8"><div className="grid gap-6 md:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow !text-[#9bd9cc]">If a message feels wrong</p><h2 className="display mt-3 text-3xl font-extrabold">Pause. Verify. Report.</h2><p className="mt-3 text-sm leading-6 text-white/70">You are not to blame for a convincing message. Prioritize your safety and take one step at a time.</p></div><ol className="space-y-3 text-sm leading-6 text-white/85">{['Stop interacting with the suspicious message or site. Do not send more information or money.','If credentials were exposed, change affected passwords from a trusted device and review active sessions.','Contact your bank or service through independently verified channels if financial or account information was involved.','Enable or review MFA. If malware is suspected, use trusted security software and seek qualified assistance.','Preserve relevant evidence safely and report to the relevant service or authority. Options depend on incident type and location.'].map((x,i)=><li key={x} className="flex gap-3"><span className="mono text-[#9bd9cc]">{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ol></div>
   <div className="mt-6 rounded-2xl border border-white/15 p-4"><b className="text-sm">Nigeria reporting option</b><p className="mt-1 text-xs leading-5 text-white/70">ngCERT individual incident reporting is a reporting option; its scope may depend on incident and location.</p><a className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#a9e0d3] underline" href={refs[4][1]} target="_blank" rel="noreferrer">Visit ngCERT incident reporting <ExternalLink size={14}/></a></div>
  </section>
  <section className="mt-12"><p className="eyebrow">Official references</p><h2 className="display mt-2 text-2xl font-extrabold">Learn from established guidance.</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{refs.slice(0,4).map(([name,url])=><a key={url} href={url} target="_blank" rel="noreferrer" className="panel flex items-center justify-between gap-3 p-4 text-sm font-semibold no-underline transition hover:border-primary/50" data-testid={`link-reference-${url.includes('cisa')?'cisa':url.includes('consumer')?'ftc':url.includes('password')?'nist-password':'nist-phishing'}`}>{name}<ExternalLink size={15} className="shrink-0 text-primary"/></a>)}</div></section>
  <section className="mt-14" id="faq"><p className="eyebrow">Straight answers</p><h2 className="display mt-2 text-3xl font-extrabold">Frequently asked questions</h2><div className="mt-5 divide-y divide-border border-y border-border">{faqItems.map(([q,a],i)=><div key={q}><button className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold" aria-expanded={open===i} onClick={()=>setOpen(open===i?null:i)} data-testid={`button-faq-${i+1}`}><span>{q}</span><ChevronDown size={18} className={`shrink-0 transition-transform ${open===i?'rotate-180':''}`}/></button>{open===i&&<p className="max-w-3xl pb-5 pr-10 text-sm leading-6 text-muted-foreground" data-testid={`content-faq-${i+1}`}>{a}</p>}</div>)}</div></section>
  <section className="panel mt-12 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Local preferences</p><h2 className="display mt-2 text-xl font-bold">Your progress stays on this browser.</h2><p className="mt-1 text-sm text-muted-foreground">Reset saved lessons, bookmarks, and checklist progress. Theme preference is preserved. Device and operating-system caches are not reset.</p>{notice&&<p className="mt-3 text-sm font-semibold text-primary" role="status" data-testid="status-reset">{notice}</p>}</div><button className="btn btn-quiet shrink-0" onClick={reset} data-testid="button-reset-local-progress"><RotateCcw size={15}/>Reset local data</button></section>
 </div></PageFrame>;
}
function NotFound() { return <PageFrame><div className="shell py-24 text-center"><p className="eyebrow">404 · No page here</p><h1 className="display mt-3 text-4xl font-extrabold">That path wandered off.</h1><p className="mt-3 text-muted-foreground">Try the home page or browse the learning library.</p><Link href="/" className="btn btn-primary mt-6" data-testid="link-not-found-home">Go home <ArrowRight size={16}/></Link></div></PageFrame>; }
function App() {
 const [platformReady,setPlatformReady] = useState(false);
 useEffect(() => {
   const platform = detectClientPlatform();
   document.documentElement.dataset.digitalSafetyPlatform = platform;
   setPlatformReady(true);
 }, []);
 if (!platformReady) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><LoaderCircle size={28} className="animate-spin"/></div><h1 className="display mt-5 text-2xl font-extrabold">Preparing Digital Safety</h1><p className="mt-2 text-sm text-muted-foreground">Checking your browser platform and choosing a responsive layout…</p><p className="mt-2 text-xs text-muted-foreground">This is a layout check, not a performance boost or security scan.</p></div></div>;
 return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Switch><Route path="/" component={Home}/><Route path="/learn" component={LearnPage}/><Route path="/threat-library" component={ThreatLibraryPage}/><Route path="/safety-check" component={SafetyCheck}/><Route path="/device-protection" component={DeviceProtection}/><Route path="/pros-cons" component={ProsCons}/><Route path="/install/android" component={InstallAndroid}/><Route path="/install/desktop" component={InstallDesktop}/><Route path="/privacy" component={Privacy}/><Route component={NotFound}/></Switch></WouterRouter>;
}
function LearnPage() { return <ThreatLibrary learningOnly/>; }
function ThreatLibraryPage() { return <ThreatLibrary/>; }
export default App;
