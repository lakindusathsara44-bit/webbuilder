import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase.js";
import { API_CONFIGURED, createSite, deleteSite, listSites, loadSite } from "./lib/sites.js";
import WebsiteEditor from "./components/WebsiteEditor.jsx";
import "./components/builder.css";

function BrandMark() {
  return <div className="brand-mark" aria-hidden="true"><span>A</span></div>;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    if (!supabaseConfigured || !supabase) {
      setMessage("Supabase is not configured. Add the values in .env.local and restart the dev server.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage(error.message);
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="brand-row"><BrandMark /><div><p className="eyebrow">APOKOLIPS PLATFORM</p><h1>Website Builder</h1></div></div>
        <div className="auth-copy">
          <p className="eyebrow">PRIVATE BETA ACCESS</p>
          <h2>Build something<br /><span>extraordinary.</span></h2>
          <p className="muted">Sign in to manage your websites, design pages, and prepare them for publishing to your own Apokolips address.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to Builder"}<span aria-hidden="true">↗</span></button>
        </form>
        <p className="invite-note">Invite-only beta · New accounts are created by an administrator.</p>
      </section>
      <aside className="visual-panel" aria-label="Platform information">
        <div className="orb orb-one" /><div className="orb orb-two" />
        <div className="visual-top"><span className="status-dot" /> BUILDER ENVIRONMENT <span className="visual-version">BETA 0.2</span></div>
        <div className="visual-content">
          <div className="mini-window">
            <div className="window-bar"><i /><i /><i /><span>your-site.sites.apokolips.xyz</span></div>
            <div className="window-body"><div className="mock-nav"><b>YOUR BRAND</b><span>HOME　 ABOUT　 CONTACT</span></div><div className="mock-hero"><small>YOUR NEXT CHAPTER STARTS HERE</small><strong>Make your<br />presence known.</strong><div className="mock-cta">Explore website　↗</div></div><div className="mock-footer"><span /><span /><span /></div></div>
          </div>
          <h3>Your ideas.<br />Your website. Your space.</h3>
          <p className="muted">A single workspace for designing, managing, and publishing your websites.</p>
        </div>
        <div className="visual-bottom"><span>APOKOLIPS</span><span>DESIGNED FOR THE NEXT WEB</span></div>
      </aside>
    </main>
  );
}

function makeSubdomain(name) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 25) || "my-site";
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 5) || Math.random().toString(36).slice(2, 7);
  return base + "-" + suffix;
}

function Dashboard({ session }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [activeSite, setActiveSite] = useState(null);
  const [error, setError] = useState("");

  const refreshSites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listSites(session.user.id, session.access_token);
      setSites(result);
    } catch (err) {
      setError(err.message || "Could not load websites.");
    } finally {
      setLoading(false);
    }
  }, [session.user.id, session.access_token]);

  useEffect(() => { refreshSites(); }, [refreshSites]);

  async function handleCreate(event) {
    event.preventDefault();
    const name = siteName.trim();
    if (!name) return;
    setCreating(true);
    setError("");
    try {
      const site = await createSite({ name, subdomain: makeSubdomain(name) }, session.user.id, session.access_token);
      setSites((current) => [site, ...current]);
      setSiteName("");
      setActiveSite(site);
    } catch (err) {
      setError(err.message || "Website creation failed.");
    } finally {
      setCreating(false);
    }
  }

  async function openSite(site) {
    setError("");
    try {
      const fullSite = await loadSite(site.id, session.user.id, session.access_token);
      setActiveSite(fullSite);
    } catch (err) {
      setError(err.message || "Could not open this website.");
    }
  }

  async function handleDelete(site) {
    if (!window.confirm("Delete " + site.name + "? This cannot be undone.")) return;
    setError("");
    try {
      await deleteSite(site.id, session.user.id, session.access_token);
      setSites((current) => current.filter((item) => item.id !== site.id));
      if (activeSite?.id === site.id) setActiveSite(null);
    } catch (err) {
      setError(err.message || "Website deletion failed.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function handleSaved(updated) {
    setSites((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
    setActiveSite((current) => current ? { ...current, ...updated } : current);
  }

  if (activeSite) {
    return <WebsiteEditor site={activeSite} token={session.access_token} userId={session.user.id} onBack={() => { setActiveSite(null); refreshSites(); }} onSaved={handleSaved} />;
  }

  return (
    <main className="dashboard builder-dashboard">
      <header className="dashboard-header">
        <div className="brand-row compact"><BrandMark /><div><p className="eyebrow">APOKOLIPS</p><h1>Website Builder</h1></div></div>
        <div className="account-area"><span className="account-email">{session.user.email}</span><button className="quiet-button" onClick={signOut}>Sign out</button></div>
      </header>

      <section className="welcome builder-welcome">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h2>Welcome to your<br /><span>creative space.</span></h2>
        <p className="muted">Create a website, edit it visually or directly in code, and save your work automatically.</p>
      </section>

      <section className="workspace-card sites-workspace">
        <div className="workspace-card-top"><div><p className="eyebrow">WEBSITES</p><h3>Your websites</h3></div><span className={API_CONFIGURED ? "connection-label connected" : "connection-label local"}>{API_CONFIGURED ? "CLOUDFLARE API CONFIGURED" : "LOCAL BROWSER MODE"}</span></div>
        {!API_CONFIGURED && <p className="mode-note">Cloudflare API is not connected yet. Websites created now are saved only in this browser and will not sync between devices.</p>}
        <form className="create-site-form" onSubmit={handleCreate}>
          <input aria-label="Website name" placeholder="Enter a website name…" value={siteName} onChange={(event) => setSiteName(event.target.value)} maxLength={60} required />
          <button className="primary-button create-site-button" type="submit" disabled={creating}>{creating ? "Creating…" : "＋ Create website"}</button>
        </form>
        {error && <p className="form-message" role="alert">{error}</p>}
        {loading ? <div className="empty-state"><div className="loading-mark small">A</div><p className="muted">Loading your websites…</p></div> : sites.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">＋</div><h4>No websites yet</h4><p className="muted">Create your first website to open the visual and code editors.</p></div>
        ) : (
          <div className="site-grid">
            {sites.map((site) => (
              <article className="site-card" key={site.id}>
                <div className="site-card-art"><div className="site-card-window"><span /><span /><span /><div className="site-card-preview"><b>{site.name.slice(0, 28)}</b><i /></div></div></div>
                <div className="site-card-content"><div className="site-card-title"><h4>{site.name}</h4><span className="draft-label">DRAFT</span></div><p className="site-domain">{site.subdomain}.sites.apokolips.xyz</p><div className="site-card-actions"><button className="primary-button site-edit-button" onClick={() => openSite(site)}>Open editor <span>↗</span></button><button className="delete-button" onClick={() => handleDelete(site)} aria-label={"Delete " + site.name} title="Delete website">⌫</button></div></div>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="dashboard-footer"><span>APOKOLIPS WEBSITE BUILDER</span><span>PRIVATE BETA · 0.2.0</span></footer>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) { setChecking(false); return undefined; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setChecking(false); }
    }).catch(() => { if (mounted) setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setChecking(false);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (checking) return <main className="loading-screen"><div className="loading-mark">A</div><p>Loading your workspace…</p></main>;
  return session ? <Dashboard session={session} /> : <SignIn />;
}
