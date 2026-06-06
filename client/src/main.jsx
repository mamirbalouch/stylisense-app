import React from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Send, ShoppingBag, RefreshCw, ChevronLeft, ChevronRight, Check, Search, TrendingUp } from 'lucide-react';
import './styles/app.css';

// ── STORE ROUTING ─────────────────────────────────────────────────────────────

const STORE_CONFIG = {
  us: {
    'asos':           { base: 'https://www.asos.com/us/search/?q=', label: 'ASOS' },
    'nordstrom':      { base: 'https://www.nordstrom.com/sr?origin=keywordsearch&keyword=', label: 'Nordstrom' },
    'free people':    { base: 'https://www.freepeople.com/search?q=', label: 'Free People' },
    'revolve':        { base: 'https://www.revolve.com/search/?q=', label: 'Revolve' },
    'urban outfitters': { base: 'https://www.urbanoutfitters.com/search?q=', label: 'Urban Outfitters' },
    'anthropologie':  { base: 'https://www.anthropologie.com/search?search=', label: 'Anthropologie' },
    'zara':           { base: 'https://www.zara.com/us/en/search?searchTerm=', label: 'Zara' },
    'h&m':            { base: 'https://www2.hm.com/en_us/search-results.html?q=', label: 'H&M' },
    'uniqlo':         { base: 'https://www.uniqlo.com/us/en/search?q=', label: 'Uniqlo' },
    "macy's":         { base: 'https://www.macys.com/shop/featured/', label: "Macy's" },
    'banana republic':{ base: 'https://bananarepublic.gap.com/browse/search.do?searchText=', label: 'Banana Republic' },
    'j.crew':         { base: 'https://www.jcrew.com/r/search?search_term=', label: 'J.Crew' },
    'amazon':         { base: 'https://www.amazon.com/s?k=', label: 'Amazon' },
  },
  uk: {
    'asos':           { base: 'https://www.asos.com/search/?q=', label: 'ASOS' },
    'selfridges':     { base: 'https://www.selfridges.com/GB/en/cat/search/?q=', label: 'Selfridges' },
    'john lewis':     { base: 'https://www.johnlewis.com/search?search-term=', label: 'John Lewis' },
    'marks & spencer':{ base: 'https://www.marksandspencer.com/s/?q=', label: 'M&S' },
    'marks and spencer': { base: 'https://www.marksandspencer.com/s/?q=', label: 'M&S' },
    'm&s':            { base: 'https://www.marksandspencer.com/s/?q=', label: 'M&S' },
    'next':           { base: 'https://www.next.co.uk/search?w=', label: 'Next' },
    'river island':   { base: 'https://www.riverisland.com/search?terms=', label: 'River Island' },
    'topshop':        { base: 'https://www.asos.com/topshop/cat/?cid=4172&q=', label: 'Topshop' },
    '& other stories':{ base: 'https://www.stories.com/en_gbp/search?q=', label: '& Other Stories' },
    'whistles':       { base: 'https://www.whistles.com/search?q=', label: 'Whistles' },
    'zara':           { base: 'https://www.zara.com/uk/en/search?searchTerm=', label: 'Zara' },
    'h&m':            { base: 'https://www2.hm.com/en_gb/search-results.html?q=', label: 'H&M' },
    'uniqlo':         { base: 'https://www.uniqlo.com/uk/en/search?q=', label: 'Uniqlo' },
    'amazon':         { base: 'https://www.amazon.co.uk/s?k=', label: 'Amazon UK' },
  },
};

const DEFAULT_STORE = {
  us: { base: 'https://www.asos.com/us/search/?q=', label: 'ASOS' },
  uk: { base: 'https://www.asos.com/search/?q=', label: 'ASOS' },
};

function resolveStore(item, region = 'us') {
  const key = (item.storeName || item.brand || '').toLowerCase().trim();
  const stores = STORE_CONFIG[region] || STORE_CONFIG.us;
  for (const [name, config] of Object.entries(stores)) {
    if (key.includes(name)) return config;
  }
  return DEFAULT_STORE[region] || DEFAULT_STORE.us;
}

function buildShopUrl(item, region = 'us') {
  const store = resolveStore(item, region);
  return store.base + encodeURIComponent(item.searchQuery || item.name);
}

function getStoreLabel(item, region = 'us') {
  return resolveStore(item, region).label;
}

// ── BUDGET OPTIONS (region-aware) ─────────────────────────────────────────────

const BUDGET_OPTIONS = {
  us: [
    { value: 'under_50',  label: 'Under $50',     desc: 'Budget-friendly finds', budgetMax: 50 },
    { value: '50_150',    label: '$50 – $150',     desc: 'Great everyday picks',  budgetMax: 150 },
    { value: '150_300',   label: '$150 – $300',    desc: 'Premium quality',       budgetMax: 300 },
    { value: '300_500',   label: '$300 – $500',    desc: 'Elevated & refined',    budgetMax: 500 },
    { value: '500_plus',  label: '$500+',          desc: 'Luxury & designer',     budgetMax: 5000 },
  ],
  uk: [
    { value: 'under_50',  label: 'Under £50',      desc: 'Budget-friendly finds', budgetMax: 50 },
    { value: '50_150',    label: '£50 – £150',      desc: 'Great everyday picks',  budgetMax: 150 },
    { value: '150_300',   label: '£150 – £300',     desc: 'Premium quality',       budgetMax: 300 },
    { value: '300_500',   label: '£300 – £500',     desc: 'Elevated & refined',    budgetMax: 500 },
    { value: '500_plus',  label: '£500+',           desc: 'Luxury & designer',     budgetMax: 5000 },
  ],
};

// ── FLOW CONFIG ───────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    id: 'region',
    ariaSays: "Hi! I'm ARIA. First — where are you shopping from? I'll tailor brands and prices to your market.",
    key: 'region',
    type: 'duo',
    options: [
      { value: 'us', label: 'United States', emoji: '🇺🇸', sub: 'USD · ASOS, Nordstrom, Revolve & more' },
      { value: 'uk', label: 'United Kingdom', emoji: '🇬🇧', sub: 'GBP · ASOS, Selfridges, John Lewis & more' },
    ],
  },
  {
    id: 'occasion',
    ariaSays: "What's the occasion? I'll build the entire look around it.",
    key: 'occasion',
    type: 'grid',
    options: [
      { value: 'office', label: 'Work / Office', emoji: '💼', desc: 'Professional polish' },
      { value: 'date night', label: 'Date Night', emoji: '🍷', desc: 'Confident & alluring' },
      { value: 'wedding', label: 'Wedding Guest', emoji: '💍', desc: 'Elegant celebration' },
      { value: 'party', label: 'Party', emoji: '✨', desc: 'Celebrate in style' },
      { value: 'dinner', label: 'Dinner Out', emoji: '🍽', desc: 'Smart evening look' },
      { value: 'casual', label: 'Casual / Weekend', emoji: '☀', desc: 'Relaxed & effortless' },
      { value: 'festival', label: 'Festival', emoji: '🎪', desc: 'Bold & expressive' },
      { value: 'travel', label: 'Travel', emoji: '✈', desc: 'Stylish on the move' },
    ],
  },
  {
    id: 'gender',
    ariaSays: "Who am I styling today?",
    key: 'gender',
    type: 'duo',
    options: [
      { value: 'female', label: 'Women', emoji: '♀', sub: 'Feminine · Elegant · Empowered' },
      { value: 'male', label: 'Men', emoji: '♂', sub: 'Sharp · Refined · Confident' },
    ],
  },
  {
    id: 'style',
    ariaSays: "What's your style personality? Pick everything that feels like you.",
    key: 'style',
    type: 'multi',
    options: [
      { value: 'elegant', label: 'Elegant', emoji: '🌸' },
      { value: 'minimal', label: 'Minimal', emoji: '◻' },
      { value: 'trendy', label: 'Trendy', emoji: '🔥' },
      { value: 'classic', label: 'Classic', emoji: '🎩' },
      { value: 'luxury', label: 'Luxury', emoji: '💎' },
      { value: 'streetwear', label: 'Streetwear', emoji: '🧢' },
      { value: 'bohemian', label: 'Bohemian', emoji: '🌿' },
      { value: 'bold', label: 'Bold', emoji: '⚡' },
      { value: 'preppy', label: 'Preppy', emoji: '🎀' },
    ],
  },
  {
    id: 'colors',
    ariaSays: "What color palette speaks to you right now?",
    key: 'colors',
    type: 'color',
    options: [
      { value: 'neutral', label: 'Neutrals', hex: '#c9a97d', dark: true },
      { value: 'black', label: 'Black & Dark', hex: '#2d2d2d' },
      { value: 'white/ivory', label: 'White & Ivory', hex: '#f5f0e8', dark: true },
      { value: 'pastel', label: 'Pastels', hex: '#f5a7b8' },
      { value: 'earth tones', label: 'Earth Tones', hex: '#9b5e38' },
      { value: 'green/blue', label: 'Green & Blue', hex: '#3d8f72' },
      { value: 'bold colors', label: 'Bold Brights', hex: '#d63031' },
      { value: 'no preference', label: 'Surprise Me', hex: '#7b5ea7' },
    ],
  },
  {
    id: 'category',
    ariaSays: "What type of clothing are you looking for?",
    key: 'category',
    type: 'grid',
    options: [
      { value: 'dress', label: 'Dress', emoji: '👗', desc: 'One-and-done look' },
      { value: 'blazer set', label: 'Blazer Set', emoji: '🧥', desc: 'Sharp & structured' },
      { value: 'jeans outfit', label: 'Jeans Outfit', emoji: '👖', desc: 'Casual elevated' },
      { value: 'co-ord set', label: 'Co-ord Set', emoji: '🎯', desc: 'Matching set' },
      { value: 'maxi / gown', label: 'Maxi / Gown', emoji: '🌟', desc: 'Floor-length drama' },
      { value: 'shirt & trousers', label: 'Shirt & Trousers', emoji: '👔', desc: 'Smart casual' },
      { value: 'jumpsuit', label: 'Jumpsuit', emoji: '✨', desc: 'Effortless one-piece' },
    ],
  },
  {
    id: 'budget',
    ariaSays: "Last one — what's your budget? I'll stay within it, strictly.",
    key: 'budget',
    type: 'budget',
    getOptions: (profile) => BUDGET_OPTIONS[profile.region || 'us'],
  },
];

const GEN_STEPS = [
  'Analyzing your style profile…',
  'Selecting flattering silhouettes…',
  'Building your color story…',
  'Sourcing items within budget…',
  'Finalizing your 3 curated looks…',
];

// ── ARIA AVATAR ───────────────────────────────────────────────────────────────

function ARIAAvatar({ size = 'md' }) {
  return <div className={`aria-avatar aria-avatar--${size}`}><span>A</span></div>;
}

// ── COLOR DOT ─────────────────────────────────────────────────────────────────

function ColorDot({ hex, name }) {
  return (
    <span
      title={name}
      style={{
        display: 'inline-block', width: 13, height: 13, borderRadius: '50%',
        background: hex, border: '1px solid rgba(255,255,255,0.18)',
        marginRight: 4, verticalAlign: 'middle', flexShrink: 0,
      }}
    />
  );
}

// ── OUTFIT ITEM ROW ───────────────────────────────────────────────────────────

function AiOutfitItem({ item, region, currency }) {
  const url = buildShopUrl(item, region);
  const storeLabel = getStoreLabel(item, region);
  return (
    <a href={url} target="_blank" rel="noreferrer" className="outfit-item-row" title={`View on ${storeLabel}`}>
      <span className="item-type-badge">{item.type}</span>
      <span className="item-name">
        <ColorDot hex={item.colorHex || '#888'} name={item.color} />
        {item.name}
        {item.brand && <span className="item-brand"> · {item.brand}</span>}
      </span>
      <span className="item-store-tag">{storeLabel}</span>
      <span className="item-price">{currency}{item.price?.toLocaleString() ?? '—'}</span>
    </a>
  );
}

// ── OUTFIT CARD ───────────────────────────────────────────────────────────────

function AiOutfitCard({ outfit, index, region, currency }) {
  const firstItem = outfit.items?.[0] || { name: outfit.name, searchQuery: outfit.name };
  return (
    <article className="ai-outfit-card">
      <div className="outfit-card-accent" />
      <div className="outfit-card-header">
        <span className="outfit-number">0{index + 1}</span>
        <h3>{outfit.name}</h3>
        <p className="outfit-description">{outfit.description}</p>
      </div>
      <div className="outfit-items">
        {outfit.items?.map((item, i) => (
          <AiOutfitItem key={i} item={item} region={region} currency={currency} />
        ))}
      </div>
      <div className="outfit-footer">
        <div className="outfit-swatches">
          {outfit.items?.map((item, i) => <ColorDot key={i} hex={item.colorHex || '#888'} name={item.color} />)}
        </div>
        <div className="outfit-total">
          <span className="total-label">complete look</span>
          <span className="total-price">{currency}{outfit.totalPrice?.toLocaleString()}</span>
        </div>
      </div>
      {outfit.colorStory && <div className="outfit-story">{outfit.colorStory}</div>}
      {(outfit.occasionNote || outfit.bodyTypeTip) && (
        <div className="outfit-tips-stack">
          {outfit.occasionNote && (
            <div className="outfit-tip-box"><span className="tip-icon">✦</span>{outfit.occasionNote}</div>
          )}
          {outfit.bodyTypeTip && (
            <div className="outfit-tip-box"><span className="tip-icon">◈</span>{outfit.bodyTypeTip}</div>
          )}
        </div>
      )}
      <a
        href={buildShopUrl(firstItem, region)}
        target="_blank" rel="noreferrer" className="shop-button"
      >
        Shop on {getStoreLabel(firstItem, region)} <ShoppingBag size={14} />
      </a>
    </article>
  );
}

// ── STYLE TIPS ACCORDION ──────────────────────────────────────────────────────

function StyleTipsPanel({ tips, avoid }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="tips-accordion">
      <button className="tips-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        Style Rules for Your Profile <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="tips-body">
          {tips?.length > 0 && (
            <div>
              <h4>Do This</h4>
              <ol>{tips.map((t, i) => <li key={i}>{t}</li>)}</ol>
            </div>
          )}
          {avoid?.length > 0 && (
            <div>
              <h4>Avoid</h4>
              <ul>{avoid.map((t, i) => <li key={i} className="avoid-item">✕ {t}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SEARCH PANEL ──────────────────────────────────────────────────────────────

function SearchPanel() {
  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState('search');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true); setResult(null); setError('');
    try {
      if (type === 'search') {
        const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ searchQuery: q }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult({ type: 'search', content: data.result, citations: data.citations, model: data.model });
      } else {
        const res = await fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, type: 'trend' }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult({ type: 'trend', content: data.summary, sources: data.sources, model: data.model });
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="search-panel">
      <div className="panel-tabs">
        <button className={`tab-btn ${type === 'search' ? 'active' : ''}`} onClick={() => setType('search')}><Search size={13} /> Product Search</button>
        <button className={`tab-btn ${type === 'trend' ? 'active' : ''}`} onClick={() => setType('trend')}><TrendingUp size={13} /> Trend Research</button>
      </div>
      <form className="search-input-row" onSubmit={handleSubmit}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder={type === 'search' ? 'e.g. pastel lawn suit PKR 12000' : "e.g. what's trending for Eid 2026?"} />
        <button type="submit" disabled={loading}>{loading ? '…' : <Send size={16} />}</button>
      </form>
      {error && <p className="search-error">{error}</p>}
      {result && (
        <div className="search-result">
          <div className="result-model-tag">{result.model}</div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{result.content}</p>
          {result.citations?.length > 0 && (
            <div className="citations">
              <strong>Sources:</strong>
              {result.citations.slice(0, 3).map((src, i) => <a key={i} href={src} target="_blank" rel="noreferrer" className="citation-link">[{i + 1}]</a>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── WELCOME SCREEN ────────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-badge"><Sparkles size={13} /> AI-Powered Personal Styling</div>
      <ARIAAvatar size="lg" />
      <div className="welcome-intro">
        <p className="aria-name-tag">ARIA — Your AI Stylist</p>
        <h1 className="welcome-headline">Style That Fits<br /><em>You</em>, Perfectly.</h1>
        <p className="welcome-sub">
          Answer 6 quick questions — your occasion, vibe, color mood, and budget —
          and I'll generate 3 complete, curated outfits just for you.
        </p>
      </div>
      <button className="cta-button" onClick={onStart}>
        Start My Style Session <ChevronRight size={17} />
      </button>
      <div className="welcome-trust">
        <span>✦ Claude AI</span>
        <span>✦ Pakistani Brands</span>
        <span>✦ Budget-Aware</span>
        <span>✦ Body-Type Informed</span>
      </div>
    </div>
  );
}

// ── STEP OPTIONS ──────────────────────────────────────────────────────────────

function StepOptions({ stepConfig, selected, multi, onSelect }) {
  if (stepConfig.type === 'duo') {
    return (
      <div className="duo-options">
        {stepConfig.options.map(opt => (
          <button key={opt.value} className={`duo-card ${selected === opt.value ? 'selected' : ''}`} onClick={() => onSelect(opt.value)}>
            <span className="duo-emoji" aria-hidden="true">{opt.emoji}</span>
            <span className="duo-label">{opt.label}</span>
            <span className="duo-sub">{opt.sub}</span>
            {selected === opt.value && <Check className="option-check" size={15} />}
          </button>
        ))}
      </div>
    );
  }

  if (stepConfig.type === 'multi') {
    return (
      <div className="multi-options">
        {stepConfig.options.map(opt => (
          <button key={opt.value} className={`multi-chip ${multi.includes(opt.value) ? 'selected' : ''}`} onClick={() => onSelect(opt.value)}>
            <span aria-hidden="true">{opt.emoji}</span>
            {opt.label}
            {multi.includes(opt.value) && <Check size={11} />}
          </button>
        ))}
      </div>
    );
  }

  if (stepConfig.type === 'color') {
    return (
      <div className="color-options">
        {stepConfig.options.map(opt => (
          <button key={opt.value} className={`color-swatch ${multi.includes(opt.value) ? 'selected' : ''}`} onClick={() => onSelect(opt.value)} aria-pressed={multi.includes(opt.value)}>
            <span className="swatch-circle" style={{ background: opt.hex }} />
            <span className="swatch-label">{opt.label}</span>
            {multi.includes(opt.value) && <Check className="swatch-check" size={11} />}
          </button>
        ))}
      </div>
    );
  }

  if (stepConfig.type === 'budget') {
    return (
      <div className="budget-options">
        {stepConfig.options.map(opt => (
          <button key={opt.value} className={`budget-card ${selected === opt.value ? 'selected' : ''}`} onClick={() => onSelect(opt.value)}>
            <div>
              <span className="budget-label">{opt.label}</span>
              <span className="budget-desc">{opt.desc}</span>
            </div>
            {selected === opt.value && <Check className="option-check" size={15} />}
          </button>
        ))}
      </div>
    );
  }

  // Default: grid
  return (
    <div className="grid-options">
      {stepConfig.options.map(opt => (
        <button key={opt.value} className={`grid-card ${selected === opt.value ? 'selected' : ''}`} onClick={() => onSelect(opt.value)}>
          <span className="card-emoji" aria-hidden="true">{opt.emoji}</span>
          <span className="card-label">{opt.label}</span>
          {opt.desc && <span className="card-desc">{opt.desc}</span>}
          {selected === opt.value && <Check className="card-check" size={11} />}
        </button>
      ))}
    </div>
  );
}

// ── WIZARD SCREEN ─────────────────────────────────────────────────────────────

function WizardScreen({ step, totalSteps, stepConfig, profile, multiBuffer, onSelect, onBack, onMultiContinue }) {
  const isMulti = stepConfig.type === 'multi' || stepConfig.type === 'color';
  return (
    <div className="wizard-screen" key={stepConfig.id}>
      <div className="wizard-topbar">
        <button className="back-btn" onClick={onBack} aria-label="Go back"><ChevronLeft size={19} /></button>
        <div className="progress-track" role="progressbar" aria-valuenow={step + 1} aria-valuemax={totalSteps}>
          <div className="progress-fill" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
        <span className="step-label" aria-live="polite">{step + 1} / {totalSteps}</span>
      </div>

      <div className="aria-speaks">
        <ARIAAvatar size="sm" />
        <div className="aria-bubble">
          <span className="aria-name-label">ARIA</span>
          {stepConfig.ariaSays}
        </div>
      </div>

      <div className="step-body">
        <StepOptions
          stepConfig={{ ...stepConfig, options: stepConfig.getOptions ? stepConfig.getOptions(profile) : stepConfig.options }}
          selected={profile[stepConfig.key]}
          multi={multiBuffer}
          onSelect={onSelect}
        />
      </div>

      {isMulti && (
        <div className="wizard-footer">
          <button className="continue-btn" onClick={() => onMultiContinue(false)} disabled={multiBuffer.length === 0}>
            {multiBuffer.length === 0 ? 'Select at least one' : `Continue — ${multiBuffer.length} selected`}
            <ChevronRight size={15} />
          </button>
          <button className="skip-link" onClick={() => onMultiContinue(true)}>Skip this question</button>
        </div>
      )}
    </div>
  );
}

// ── GENERATING SCREEN ─────────────────────────────────────────────────────────

function GeneratingScreen({ profile }) {
  const [genStep, setGenStep] = React.useState(0);
  React.useEffect(() => {
    if (genStep < GEN_STEPS.length - 1) {
      const t = setTimeout(() => setGenStep(s => s + 1), 1500);
      return () => clearTimeout(t);
    }
  }, [genStep]);

  return (
    <div className="generating-screen">
      <ARIAAvatar size="lg" />
      <div className="gen-title">
        <h2>Curating your looks</h2>
        <p className="gen-subtitle">
          {profile.gender === 'female' ? "Women's" : profile.gender === 'male' ? "Men's" : ''}
          {profile.occasion ? ` ${profile.occasion}` : ''} style · within budget
        </p>
      </div>
      <div className="gen-steps-list" aria-live="polite">
        {GEN_STEPS.map((s, i) => (
          <div key={i} className={`gen-step-item ${i < genStep ? 'done' : ''} ${i === genStep ? 'active' : ''}`}>
            <span className="gen-dot">{i < genStep ? <Check size={9} /> : null}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <div className="gen-dots" aria-hidden="true"><span /><span /><span /></div>
    </div>
  );
}

// ── RESULTS SCREEN ────────────────────────────────────────────────────────────

const QUICK_ASKS = [
  'Can I swap the colors?',
  'What accessories work here?',
  'Which outfit suits a modest look?',
  'How do I style this for a different occasion?',
];

function ResultsScreen({ recommendation, profile, onReset }) {
  const [tab, setTab] = React.useState('outfits');
  const [chatInput, setChatInput] = React.useState('');
  const [chatLoading, setChatLoading] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState([{
    role: 'aria',
    text: `Your looks are ready! I've curated ${recommendation.outfits?.length || 3} complete outfits for your ${profile.occasion || 'occasion'}. Ask me anything — color swaps, accessory tips, fit questions, whatever you need.`,
  }]);
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    if (tab === 'ask') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, tab]);

  async function handleAsk(e) {
    e?.preventDefault();
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, currentOutfits: recommendation.outfits, userProfile: profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setChatMessages(prev => [...prev, { role: 'aria', text: data.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'aria', text: "I'm having trouble connecting right now. Try again in a moment." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const titleCase = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const styleLabel = Array.isArray(profile.style) ? profile.style.slice(0, 2).join(' · ') : (profile.style || 'Personalized');

  return (
    <div className="results-screen">
      <div className="results-header">
        <div>
          <span className="results-eyebrow"><Sparkles size={12} /> Your Style, Curated by ARIA</span>
          <h2 className="results-title">
            {titleCase(profile.occasion || '')} {styleLabel} Looks
          </h2>
          {profile.colors?.length > 0 && (
            <p className="results-meta">Color palette: {profile.colors.join(' + ')}</p>
          )}
        </div>
        <button className="ghost-button" onClick={onReset}><RefreshCw size={14} /> Start Over</button>
      </div>

      <div className="results-tabs">
        <button className={`tab-btn ${tab === 'outfits' ? 'active' : ''}`} onClick={() => setTab('outfits')}><Sparkles size={12} /> Your Outfits</button>
        <button className={`tab-btn ${tab === 'ask' ? 'active' : ''}`} onClick={() => setTab('ask')}>Ask ARIA</button>
        <button className={`tab-btn ${tab === 'search' ? 'active' : ''}`} onClick={() => setTab('search')}><Search size={12} /> Product Search</button>
      </div>

      {tab === 'outfits' && (
        <>
          <div className="ai-outfit-grid">
            {recommendation.outfits.map((outfit, i) => (
              <AiOutfitCard key={outfit.id || i} outfit={outfit} index={i} region={profile.region || 'us'} currency={profile.currency || '$'} />
            ))}
          </div>
          {(recommendation.generalTips?.length > 0 || recommendation.avoidList?.length > 0) && (
            <StyleTipsPanel tips={recommendation.generalTips} avoid={recommendation.avoidList} />
          )}
          <div className="ask-cta" onClick={() => setTab('ask')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setTab('ask')}>
            <ARIAAvatar size="sm" />
            <div className="ask-cta-text">
              <strong>Questions about these looks?</strong>
              <p>Ask ARIA to swap colors, suggest accessories, or tailor anything to your needs.</p>
            </div>
            <ChevronRight size={18} className="ask-cta-arrow" />
          </div>
        </>
      )}

      {tab === 'ask' && (
        <div className="ask-panel">
          <div className="ask-chat-window">
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                {m.role === 'aria' && <ARIAAvatar size="xs" />}
                <div className="bubble-text">{m.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble chat-bubble--aria">
                <ARIAAvatar size="xs" />
                <div className="bubble-text"><span className="typing-dots"><span /><span /><span /></span></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="quick-asks">
            {QUICK_ASKS.map(q => (
              <button key={q} className="quick-ask-chip" onClick={() => { setChatInput(q); }}>
                {q}
              </button>
            ))}
          </div>
          <form className="ask-input-row" onSubmit={handleAsk}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask ARIA anything about your outfits…"
              aria-label="Ask a follow-up question"
            />
            <button type="submit" disabled={chatLoading || !chatInput.trim()} aria-label="Send"><Send size={15} /></button>
          </form>
        </div>
      )}

      {tab === 'search' && <SearchPanel />}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

function App() {
  const [mode, setMode] = React.useState('welcome');
  const [step, setStep] = React.useState(0);
  const [profile, setProfile] = React.useState({});
  const [multiBuffer, setMultiBuffer] = React.useState([]);
  const [aiRecommendation, setAiRecommendation] = React.useState(null);
  const [genError, setGenError] = React.useState('');

  const stepConfig = FLOW_STEPS[step];
  const isMultiStep = stepConfig?.type === 'multi' || stepConfig?.type === 'color';

  // Pre-populate multi buffer when entering a multi-type step
  React.useEffect(() => {
    if (mode !== 'wizard' || !stepConfig) return;
    if (isMultiStep) {
      const existing = profile[stepConfig.key];
      setMultiBuffer(Array.isArray(existing) ? existing : []);
    } else {
      setMultiBuffer([]);
    }
  }, [step, mode]);

  function handleSelect(value) {
    if (isMultiStep) {
      setMultiBuffer(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else {
      const updated = { ...profile, [stepConfig.key]: value };
      if (stepConfig.id === 'region') {
        updated.currency = value === 'uk' ? '£' : '$';
        updated.currencyCode = value === 'uk' ? 'GBP' : 'USD';
      }
      if (stepConfig.id === 'budget') {
        const opts = BUDGET_OPTIONS[profile.region || 'us'];
        const opt = opts?.find(o => o.value === value);
        if (opt) updated.budgetMax = opt.budgetMax;
      }
      setProfile(updated);
      advance(updated);
    }
  }

  function handleMultiContinue(skip) {
    const updated = { ...profile };
    if (!skip && multiBuffer.length > 0) updated[stepConfig.key] = multiBuffer;
    setMultiBuffer([]);
    setProfile(updated);
    advance(updated);
  }

  function advance(updated) {
    if (step < FLOW_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      generateOutfits(updated);
    }
  }

  function goBack() {
    if (step === 0) setMode('welcome');
    else setStep(s => s - 1);
  }

  async function generateOutfits(profileData) {
    setMode('generating');
    setGenError('');
    try {
      const res = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setAiRecommendation(data.recommendation);
      setMode('results');
    } catch (err) {
      setGenError(err.message);
      setMode('error');
    }
  }

  function reset() {
    setMode('welcome');
    setStep(0);
    setProfile({});
    setMultiBuffer([]);
    setAiRecommendation(null);
    setGenError('');
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-inner">
          <button className="header-logo" onClick={reset} aria-label="Go to home">
            <Sparkles size={15} />
            <span>STYLISENSE</span>
          </button>
          <span className="header-tagline">AI Personal Stylist</span>
        </div>
      </header>

      <main className="app-main">
        {mode === 'welcome' && <WelcomeScreen onStart={() => setMode('wizard')} />}

        {mode === 'wizard' && stepConfig && (
          <WizardScreen
            step={step}
            totalSteps={FLOW_STEPS.length}
            stepConfig={stepConfig}
            profile={profile}
            multiBuffer={multiBuffer}
            onSelect={handleSelect}
            onBack={goBack}
            onMultiContinue={handleMultiContinue}
          />
        )}

        {mode === 'generating' && <GeneratingScreen profile={profile} />}

        {mode === 'error' && (
          <div className="error-screen">
            <ARIAAvatar size="lg" />
            <h2>Something went wrong</h2>
            <p>{genError || 'ARIA encountered an issue. Please try again.'}</p>
            <button className="cta-button" onClick={() => { setStep(FLOW_STEPS.length - 1); setMode('wizard'); }}>
              Try Again
            </button>
          </div>
        )}

        {mode === 'results' && aiRecommendation && (
          <ResultsScreen recommendation={aiRecommendation} profile={profile} onReset={reset} />
        )}
      </main>

      <footer className="app-footer">
        <span>Powered by Claude AI · Perplexity · FASHN</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
