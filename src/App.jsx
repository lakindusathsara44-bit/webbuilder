import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase.js";

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span>A</span>
    </div>
  );
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
      setMessage("Supabase is not configured yet. Add the values in .env.local and restart the dev server.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    setBusy(false);

    if (error) setMessage(error.message);
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="brand-row">
          <BrandMark />
          <div>
            <p className="eyebrow">APOKOLIPS PLATFORM</p>
            <h1>Website Builder</h1>
          </div>
        </div>

        <div className="auth-copy">
          <p className="eyebrow">PRIVATE BETA ACCESS</p>
          <h2>Build something<br /><span>extraordinary.</span></h2>
          <p className="muted">Sign in to manage your websites, edit pages, and publish to your own Apokolips site address.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {message && <p className="form-message" role="alert">{message}</p>}

          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in to Builder"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="invite-note">Invite-only beta · New accounts are created by an administrator.</p>
      </section>

      <aside className="visual-panel" aria-label="Platform information">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="visual-top"><span className="status-dot" /> BUILDER ENVIRONMENT <span className="visual-version">BETA 0.1</span></div>
        <div className="visual-content">
          <div className="mini-window">
            <div className="window-bar"><i /><i /><i /><span>your-site.sites.apokolips.xyz</span></div>
            <div className="window-body">
              <div className="mock-nav"><b>YOUR BRAND</b><span>HOME　 ABOUT　 CONTACT</span></div>
              <div className="mock-hero"><small>YOUR NEXT CHAPTER STARTS HERE</small><strong>Make your<br />presence known.</strong><div className="mock-cta">Explore website　↗</div></div>
              <div className="mock-footer"><span /><span /><span /></div>
            </div>
          </div>
          <h3>Your ideas.<br />Your website. Your space.</h3>
          <p className="muted">A single workspace for designing, managing, and publishing your websites.</p>
        </div>
        <div className="visual-bottom"><span>APOKOLIPS</span><span>DESIGNED FOR THE NEXT WEB</span></div>
      </aside>
    </main>
  );
}

function Dashboard({ session }) {
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="brand-row compact"><BrandMark /><div><p className="eyebrow">APOKOLIPS</p><h1>Website Builder</h1></div></div>
        <div className="account-area"><span className="account-email">{session.user.email}</span><button className="quiet-button" onClick={signOut}>Sign out</button></div>
      </header>
      <section className="welcome">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h2>Welcome to your<br /><span>creative space.</span></h2>
        <p className="muted">Your Builder workspace is connected. Website management and the visual/code editor will be introduced in the next milestone.</p>
      </section>
      <section className="workspace-card">
        <div className="workspace-card-top"><div><p className="eyebrow">WEBSITES</p><h3>Your websites</h3></div><span className="coming-label">COMING IN MILESTONE 02</span></div>
        <div className="empty-state"><div className="empty-icon">＋</div><h4>No websites yet</h4><p className="muted">Your websites will appear here after the site creation workflow is enabled.</p></div>
      </section>
      <footer className="dashboard-footer"><span>APOKOLIPS WEBSITE BUILDER</span><span>PRIVATE BETA · 0.1.0</span></footer>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setChecking(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return <main className="loading-screen"><div className="loading-mark">A</div><p>Loading your workspace…</p></main>;
  }

  return session ? <Dashboard session={session} /> : <SignIn />;
}
