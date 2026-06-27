import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { aiStructures, alerts, categories, features, getSummaryStats, safetyTips, tools, trends } from './data'

const webchatInjectUrl = import.meta.env.VITE_BOTPRESS_WEBCHAT_INJECT_URL || ''
const webchatConfigUrl = import.meta.env.VITE_BOTPRESS_WEBCHAT_CONFIG_URL || ''

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Link({ href, className, children }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        if (href.startsWith('/')) {
          event.preventDefault()
          navigate(href)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }}
    >
      {children}
    </a>
  )
}

function useRoute() {
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search + window.location.hash)
  useEffect(() => {
    const update = () => setLocation(window.location.pathname + window.location.search + window.location.hash)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  return location
}

function Header({ currentPage }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span>RedFlag<small>Your AI-powered scam detection companion.</small></span>
        </Link>
        <button className="nav-toggle" type="button" aria-label="Open navigation" onClick={() => setOpen((value) => !value)}>Menu</button>
        <ul className={`nav-links ${open ? 'open' : ''}`}>
          <li><Link className={currentPage === 'home' ? 'active' : ''} href="/">Home</Link></li>
          <li><Link href="/#features">Features</Link></li>
          <li><Link href="/#how-it-works">How It Works</Link></li>
          <li><Link className={currentPage === 'chatbot' ? 'active' : ''} href="/chatbot?mode=recovery">Get Help</Link></li>
          <li><Link className="nav-cta" href="/checker">Get Started</Link></li>
        </ul>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <p>RedFlag by 1ntruder. Stay safer online.</p>
    </footer>
  )
}

function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="hero-pill">AI-powered scam protection</p>
            <h1>Spot scams.<br /><span>Stop scammers.</span></h1>
            <p className="home-hero-description">Train yourself, detect threats, check suspicious content, and get help if you have been scammed. All in one AI-powered platform.</p>
            <div className="hero-actions">
              <a className="hero-secondary hero-explore" href="#features">Explore features <span aria-hidden="true">-&gt;</span></a>
            </div>
            <p className="hero-note">Built by 1ntruder. Stay safer online, every day.</p>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
            <div className="hero-shield"><span>✓</span></div>
            <div className="hero-bubble bubble-top"><b>Too good to be true?</b><span>Trust, but verify.</span></div>
            <div className="hero-bubble bubble-left"><b>Suspicious message?</b><span>We will check it.</span></div>
            <div className="hero-bubble bubble-right"><b>Not sure about a link?</b><span>Check it first.</span></div>
            <div className="hero-bubble bubble-bottom"><b>Been scammed?</b><span>We will guide you step by step.</span></div>
          </div>
        </div>
      </section>
      <section className="redflag-features" id="features">
        <div className="redflag-section-heading">
          <p className="section-label">Stay scam-safe</p>
          <h2>Everything you need to spot a scam</h2>
          <p>Simple AI tools for checking suspicious content, learning scam patterns, and taking the right next step.</p>
        </div>
        <div className="redflag-feature-grid">
          {features.map((feature) => (
            <Link key={feature.title} className={`redflag-feature-card ${feature.tone}`} href={feature.link}>
              <span className={`redflag-feature-icon icon-${feature.icon}`} aria-hidden="true"></span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="redflag-feature-action">{feature.action} <span aria-hidden="true">-&gt;</span></span>
            </Link>
          ))}
        </div>
        <div className="redflag-values" id="how-it-works">
          {[
            ['Safe', 'Your safety comes first', 'Clear guidance for every situation'],
            ['AI', 'AI-powered', 'Smart detection and guidance'],
            ['Lock', 'Privacy first', 'Your content stays protected'],
            ['Learn', 'Always learning', 'Improving to protect you better'],
          ].map(([label, title, copy]) => (
            <div key={label}><span>{label}</span><p><strong>{title}</strong><small>{copy}</small></p></div>
          ))}
        </div>
      </section>
    </>
  )
}

function Checker() {
  const [mode, setMode] = useState('text')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [context, setContext] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!image) {
      setImagePreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(image)
    setImagePreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [image])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setAnalysis(null)

    const submittedMessage = mode === 'link' ? link : message

    if (!submittedMessage.trim() && !context.trim()) {
      setError('Paste suspicious text, a link, or context before running analysis. Image OCR is not enabled in the React/Vercel version yet.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: submittedMessage, context, inputType: mode }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Analysis failed.')
      setAnalysis(payload.analysis)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="checker-page">
      <div className="checker-heading">
        <h1>Scam detector</h1>
        <p>Paste text, check a link, or upload a screenshot preview. Text and links are analysed by the connected Botpress checker.</p>
      </div>
      <div className="checker-layout">
        <form className="form-card checker-form" onSubmit={submit}>
          <p className="form-kicker">What do you want to check?</p>
          <div className="checker-mode-switch" role="group" aria-label="Choose content type">
            <button className={`checker-mode ${mode === 'text' ? 'active' : ''}`} type="button" onClick={() => setMode('text')}>↗ Paste text</button>
            <button className={`checker-mode ${mode === 'link' ? 'active' : ''}`} type="button" onClick={() => setMode('link')}>⌁ Paste link</button>
            <button className={`checker-mode ${mode === 'image' ? 'active' : ''}`} type="button" onClick={() => setMode('image')}>▧ Upload image</button>
          </div>
          {mode === 'text' ? (
            <div className="checker-mode-panel">
              <label htmlFor="messageInput">Message, email, listing, or link</label>
              <textarea id="messageInput" rows="6" placeholder="Paste the suspicious text or URL here..." value={message} onChange={(event) => setMessage(event.target.value)} />
            </div>
          ) : mode === 'link' ? (
            <div className="checker-mode-panel">
              <label htmlFor="linkInput">Suspicious link</label>
              <input id="linkInput" type="url" placeholder="https://example.com/suspicious-page" value={link} onChange={(event) => setLink(event.target.value)} />
            </div>
          ) : (
            <div className="checker-mode-panel">
              <label className="image-dropzone" htmlFor="screenshotInput">
                <span className="image-dropzone-icon" aria-hidden="true">▧</span>
                <strong>Drop an image here or click to browse</strong>
                <small>Screenshots are previewed locally. Paste extracted text for analysis.</small>
              </label>
              <input id="screenshotInput" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
              {image && <p className="selected-file">{image.name}</p>}
            </div>
          )}
          <label htmlFor="contextInput">Additional context <span>(optional)</span></label>
          <textarea id="contextInput" rows="3" placeholder="Any extra context, e.g. received via WhatsApp" value={context} onChange={(event) => setContext(event.target.value)} />
          <button className="btn btn-primary checker-submit" type="submit" disabled={loading}>⌁ Analyse for scam signals</button>
          <div className={`analysis-loading ${loading ? '' : 'hidden'}`} role="status" aria-live="polite">
            <span className="loading-spinner" aria-hidden="true"></span>
            <span>Scanning for red flags...</span>
          </div>
        </form>
        <aside className="checker-result-panel" aria-live="polite">
          {error && <article className="result-card checker-result-card"><h2>Analysis Error</h2><p>{error}</p></article>}
          {analysis && (
            <article className={`result-card checker-result-card risk-${String(analysis.riskLevel || '').toLowerCase()}`}>
              <h2>Scam Risk Analysis</h2>
              <p><strong>Risk Level:</strong> <span className="risk-badge">{analysis.riskLevel}</span></p>
              <p><strong>Possible Scam Type:</strong> {analysis.scamType}</p>
              <div className="analysis-points"><strong>Red Flags:</strong>{analysis.redFlags?.length ? <ul>{analysis.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : <p>None returned</p>}</div>
              <div className="analysis-points"><strong>Recommended Action:</strong><ul>{String(analysis.recommendedAction || '').split(/\n|(?<=\.)\s+(?=[A-Z])/).map((action) => action.trim()).filter(Boolean).map((action) => <li key={action}>{action}</li>)}</ul></div>
            </article>
          )}
          {!error && !analysis && <div className="checker-empty-state"><span className="checker-empty-icon" aria-hidden="true">⌁</span><p>Analysis results will appear here</p></div>}
          {imagePreviewUrl && <img className="checker-image-preview" src={imagePreviewUrl} alt="Uploaded screenshot preview" />}
        </aside>
      </div>
    </section>
  )
}

function BotpressPanel({ recovery = false }) {
  const [ready, setReady] = useState(false)
  const [configured, setConfigured] = useState(Boolean(webchatInjectUrl || webchatConfigUrl))

  useEffect(() => {
    let cancelled = false

    async function loadWebchat() {
      let urls = [webchatInjectUrl, webchatConfigUrl].filter(Boolean)

      if (!urls.length) {
        try {
          const response = await fetch('/api/webchat-config')
          const payload = await response.json()
          urls = [payload.injectUrl, payload.configUrl].filter(Boolean)
        } catch {
          urls = []
        }
      }

      if (cancelled) return
      setConfigured(urls.length > 0)

      for (const src of urls) {
        await loadScript(src)
        if (cancelled) return
      }
    }

    loadWebchat()

    const timer = setInterval(() => {
      if (window.botpress?.open || window.botpress?.toggle || window.botpress?.sendEvent) setReady(true)
    }, 250)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  function openChat() {
    const botpress = window.botpress
    if (!botpress) return

    if (typeof botpress.open === 'function') {
      botpress.open()
      return
    }

    if (typeof botpress.toggle === 'function') {
      botpress.toggle()
      return
    }

    if (typeof botpress.sendEvent === 'function') {
      botpress.sendEvent({ type: 'show' })
      botpress.sendEvent({ type: 'open' })
    }
  }

  return (
    <section className={`chatbot-panel ${recovery ? 'recovery-chat-panel' : ''}`} aria-label={recovery ? 'Botpress recovery chatbot' : 'Botpress chatbot'}>
      <div className="webchat-box">
        <div className="webchat-loading">
          <p>{ready ? (recovery ? 'RedFlag recovery guide is ready.' : 'RedFlag chatbot is ready.') : configured ? 'Loading RedFlag chatbot...' : 'Configure Botpress webchat environment variables in Vercel to load webchat.'}</p>
          <p className="form-note">{recovery ? 'Ask: I think I have been scammed.' : 'Ask about suspicious messages, scam warning signs, or what to do next.'}</p>
          <button className="btn btn-primary" type="button" onClick={openChat} disabled={!ready}>{recovery ? 'Open recovery chat' : 'Open RedFlag chat'}</button>
        </div>
      </div>
    </section>
  )
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)

    if (existing?.dataset.loaded === 'true') {
      resolve()
      return
    }

    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', reject, { once: true })
    document.body.appendChild(script)
  })
}

function Chatbot() {
  const isRecovery = new URLSearchParams(window.location.search).get('mode') === 'recovery'

  if (isRecovery) {
    return (
      <section className="recovery-chat-page">
        <div className="training-intro">
          <p className="section-label">Recovery guide</p>
          <h1>Scam Recovery Guide</h1>
          <p>Get step-by-step support through the connected Botpress chatbot if you think you have been scammed.</p>
        </div>
        <div className="recovery-layout">
          <section className="recovery-guide-panel" aria-label="Immediate recovery steps">
            <p className="result-label">FIRST STEPS</p>
            <h2>If you may have been scammed, act fast.</h2>
            <ol className="recovery-steps">
              <li><strong>Contact your bank immediately</strong> to block cards, freeze accounts, or activate anti-scam controls.</li>
              <li><strong>File a police report</strong> online or at a nearby police post. Call 999 for urgent assistance.</li>
              <li><strong>Secure your accounts</strong> by changing passwords, enabling two-factor authentication, and warning contacts.</li>
              <li><strong>Report the scam on the platform</strong> and keep screenshots, account details, links, receipts, and chat logs.</li>
            </ol>
            <p className="form-note">For Singapore scams, call the 24/7 ScamShield Helpline at 1799 if you are unsure what to do next.</p>
          </section>
          <BotpressPanel recovery />
        </div>
      </section>
    )
  }

  return <Training />
}

function Training() {
  const [challenge, setChallenge] = useState('Job Scam')
  const [game, setGame] = useState(false)
  const [selected, setSelected] = useState([])
  const [score, setScore] = useState(null)
  const flags = ['Unrealistic $500/day salary', 'Redirects to Telegram', 'Upfront registration fee', 'Urgency and limited slots']
  const challenges = ['Job Scam', 'Bank Scam', 'Parcel Scam', 'Investment Scam', 'Romance Scam']

  if (game) {
    const found = selected.length
    const points = Math.round((found / flags.length) * 100)
    return (
      <section className="training-game">
        <div className="training-game-header">
          <button className="training-back" type="button" onClick={() => { setGame(false); setScore(null); setSelected([]) }} aria-label="Back to challenges">←</button>
          <div><p>Challenge: <strong>{challenge}</strong></p><span>1 / 5</span></div>
          <span className="game-progress" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        </div>
        <main className={`training-game-content ${score ? 'score-view' : ''}`}>
          <p className="game-instruction">Click on all the <strong>red flags</strong> in the message below.</p>
          <article className="telegram-simulation" aria-label="Telegram job scam simulation">
            <header className="telegram-header"><span className="telegram-avatar" aria-hidden="true">➤</span><span><strong>Recruiter</strong><small>last seen recently</small></span><span className="telegram-actions" aria-hidden="true">☎ ⋮</span></header>
            <div className="telegram-chat">
              <div className="telegram-message">
                <p>Hi! We found your profile on JobStreet.</p>
                <p>We have a part-time job you can do from home and earn <Flag index={0} selected={selected} setSelected={setSelected}>$500/day!</Flag></p>
                <p>No experience required.</p>
                <p>Contact us on <Flag index={1} selected={selected} setSelected={setSelected}>Telegram: @FastCash123</Flag></p>
                <p>You only need to pay a <Flag index={2} selected={selected} setSelected={setSelected}>$30 registration fee</Flag> to get started.</p>
                <p><Flag index={3} selected={selected} setSelected={setSelected}>Limited slots! Reply now</Flag> before it is too late!</p>
              </div>
            </div>
            <footer className="telegram-compose"><span aria-hidden="true">☺</span><span>Message</span><b aria-hidden="true">📎</b><i aria-hidden="true">↑</i></footer>
          </article>
          <p className="training-tip"><strong>Tip:</strong> Look out for urgency, money requests, suspicious links, and unverified platforms.</p>
          {score && <p className="training-score">You found {found} of {flags.length} red flags. {found === flags.length ? 'Excellent spotting.' : 'Review the message and try again.'}</p>}
          <button className="training-submit" type="button" onClick={() => score ? (setGame(false), setScore(null), setSelected([])) : setScore(points)}>{score ? 'Next challenge' : "I'm done! Check my score"} <span aria-hidden="true">-&gt;</span></button>
          {score && (
            <aside className="training-results" aria-live="polite">
              <section className="result-summary">
                <span className="result-emoji" aria-hidden="true">😅</span>
                <p className="result-label">JOB SCAM</p>
                <h2>{found === flags.length ? 'Excellent work! You found every red flag.' : 'This one fooled most people too.'}</h2>
                <p>You found {found} of 4 red flags</p>
                <strong className="result-points">{points}<small>/ 100</small></strong>
              </section>
              {found !== flags.length && (
                <section className="result-review missed-flags">
                  <p className="result-label">MISSED FLAGS ({flags.length - found})</p>
                  {flags.map((flag, index) => !selected.includes(index) && <article key={flag}><h3>{flag}</h3><p>Scammers use this tactic to rush decisions or move you away from safer official channels.</p></article>)}
                </section>
              )}
            </aside>
          )}
        </main>
      </section>
    )
  }

  return (
    <>
      <section className="training-page">
        <div className="training-intro">
          <p className="section-label">RedFlag training simulator</p>
          <h1>Choose a challenge</h1>
          <p>Practise spotting common scam tactics in safe, realistic scenarios.</p>
        </div>
        <div className="challenge-grid" aria-label="Training challenges">
          {challenges.map((item) => (
            <button key={item} className={`challenge-card ${challenge === item ? 'active' : ''}`} type="button" onClick={() => { setChallenge(item); setGame(true) }}>
              <span className={`challenge-icon icon-${item.split(' ')[0].toLowerCase()}`} aria-hidden="true"></span><strong>{item}</strong><small>Best: 80 <span aria-hidden="true">★</span></small>
            </button>
          ))}
        </div>
        <section className="training-progress" aria-live="polite">
          <div>
            <p className="training-progress-kicker">Selected challenge</p>
            <h2>{challenge}</h2>
            <p>Learn the tell-tale red flags before making a decision.</p>
            <button className="training-start" type="button" onClick={() => setGame(true)}>Start challenge <span aria-hidden="true">-&gt;</span></button>
          </div>
          <div className="training-level">
            <span className="training-trophy" aria-hidden="true">★</span>
            <p><strong>Level 1</strong><br />Rookie Scam Spotter</p>
            <span className="training-points">0 / 2000 XP</span>
            <span className="training-meter"><span></span></span>
          </div>
          <div className="training-flag" aria-hidden="true"><span>!</span></div>
        </section>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <h2>Ask RedFlag</h2>
          <p>Use the chatbot for scam questions, suspicious messages, and next-step guidance.</p>
        </div>
        <BotpressPanel />
      </section>
    </>
  )
}

function Flag({ index, selected, setSelected, children }) {
  const active = selected.includes(index)
  return (
    <button
      type="button"
      className={`red-flag ${active ? 'selected' : ''}`}
      onClick={() => setSelected((items) => active ? items.filter((item) => item !== index) : [...items, index])}
    >
      {children}
    </button>
  )
}

function Alerts() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('recent')
  const stats = getSummaryStats()
  const visibleAlerts = useMemo(() => {
    const riskOrder = { High: 3, Medium: 2, Low: 1 }
    return alerts
      .filter((alert) => !category || alert.category === category)
      .filter((alert) => [alert.title, alert.category, alert.description, ...alert.warningSigns].join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sort === 'risk' ? riskOrder[b.risk] - riskOrder[a.risk] : 0)
  }, [query, category, sort])

  return (
    <section className="scam-alerts-page">
      <div className="scam-alerts-hero"><p className="section-label">Scam alerts</p><h1>Latest Scam Alerts</h1><p>Stay informed about newly reported scams and learn how to protect yourself.</p></div>
      <section className="scam-alerts-controls">
        <article className="form-card">
          <form>
            <div className="two-column">
              <label htmlFor="searchInput">Search</label>
              <input id="searchInput" type="search" placeholder="Search scam title, category, or warning signs" value={query} onChange={(event) => setQuery(event.target.value)} />
              <label htmlFor="categorySelect">Filter by scam category</label>
              <select id="categorySelect" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <label htmlFor="sortSelect">Sort by</label>
              <select id="sortSelect" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Most Recent</option><option value="risk">Highest Risk</option></select>
            </div>
          </form>
        </article>
      </section>
      <section className="scam-alerts-stats">
        {[[stats.today, "Today's Alerts"], [stats.active, 'Active Scams'], [stats.highRisk, 'High Risk Alerts'], [stats.weekly, 'Reported This Week']].map(([value, label]) => <article className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></article>)}
      </section>
      <section className="alert-grid">
        {visibleAlerts.map((alert) => (
          <article className="alert-card-modern" key={alert.id}>
            <div className="alert-card-content">
              <div className="alert-card-badges">
                <span className="alert-category-badge">{alert.category}</span>
                <span className={`alert-risk-badge ${alert.risk.toLowerCase()}`}>{alert.risk} Risk</span>
              </div>
              <h2 className="alert-card-title">{alert.title}</h2>
              <p className="alert-card-date">Reported: {alert.reportedDate}</p>
              <p>{alert.description}</p>
              <div className="alert-lists"><div><strong>Warning Signs:</strong><ul>{alert.warningSigns.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>Recommended Actions:</strong><ul>{alert.recommendedActions.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
            </div>
          </article>
        ))}
      </section>
      <div className="scam-alerts-lower">
        <section className="trends-panel"><h3>Latest Scam Trends</h3><ul className="trend-list">{trends.map((trend) => <li key={trend}>{trend}</li>)}</ul></section>
        <section className="tips-panel"><h3>Safety Tips</h3><ul className="tips-list">{safetyTips.map((tip) => <li key={tip}><span>✓</span> {tip}</li>)}</ul></section>
      </div>
    </section>
  )
}

function About() {
  return (
    <>
      <section className="page-hero compact"><h1>About AI</h1><p>RedFlag combines practical web tools with modern AI concepts for scam education and safer decision-making.</p></section>
      <section className="content-section"><div className="section-heading"><h2>Tools Used</h2><p>These tools support chatbot creation, AI experiments, research, and development.</p></div><div className="card-grid">{tools.map((tool) => <article className="card" key={tool.name}><h3>{tool.name}</h3><p>{tool.purpose}</p></article>)}</div></section>
      <section className="content-section"><div className="section-heading"><h2>AI Structures</h2><p>Key AI concepts used in the RedFlag experience.</p></div><div className="card-grid">{aiStructures.map((item) => <article className="card" key={item.name}><h3>{item.name}</h3><p>{item.explanation}</p></article>)}</div></section>
    </>
  )
}

function NotFound() {
  return <section className="page-hero compact"><h1>Page not found</h1><p>The page you requested does not exist.</p></section>
}

function App() {
  const route = useRoute()
  const path = route.split(/[?#]/)[0]
  const currentPage = path === '/' ? 'home' : path.slice(1).split('/')[0]

  useEffect(() => {
    document.body.className = `page-${currentPage}`
  }, [currentPage])

  const page = path === '/' ? <Home /> : path === '/checker' ? <Checker /> : path === '/chatbot' ? <Chatbot /> : path === '/alerts' ? <Alerts /> : path === '/about' ? <About /> : <NotFound />

  return (
    <>
      <Header currentPage={currentPage} />
      <main className="site-main">{page}</main>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
