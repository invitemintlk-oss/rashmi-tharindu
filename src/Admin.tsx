import React, { useEffect, useMemo, useState } from 'react';
import { PREFIXES, Prefix, buildDisplayName, buildInviteLink, buildInviteMessage, COUPLE_EN } from './guest';

interface GeneratedLink {
  id: string;
  displayName: string;
  url: string;
  createdAt: string;
}

const STORAGE_KEY = 'generatedLinks.v2';

function loadHistory(): GeneratedLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(links: GeneratedLink[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch {
    /* storage unavailable */
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts / older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export default function Admin() {
  const [prefix, setPrefix] = useState<Prefix>('මහතා');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<{ displayName: string; url: string } | null>(null);
  const [history, setHistory] = useState<GeneratedLink[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setHistory(loadHistory()), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const liveDisplayName = buildDisplayName(prefix, guestName);
  const message = useMemo(
    () => (generated ? buildInviteMessage(generated.displayName, generated.url) : ''),
    [generated]
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveDisplayName) return;
    const url = buildInviteLink(window.location.origin, liveDisplayName);
    setGenerated({ displayName: liveDisplayName, url });

    const entry: GeneratedLink = {
      id: crypto.randomUUID(),
      displayName: liveDisplayName,
      url,
      createdAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    const next = [entry, ...history.filter((h) => h.url !== url)].slice(0, 100);
    setHistory(next);
    saveHistory(next);
  };

  const handleCopy = async (text: string, label: string) => {
    setToast((await copyText(text)) ? label : 'Copy failed – please copy manually');
  };

  const handleDelete = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    saveHistory(next);
  };

  const inputCls =
    'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all';

  return (
    <div className="h-[100dvh] overflow-y-auto bg-[#F7F1E6] py-10 px-4" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <p className="text-[0.7rem] tracking-[0.3em] text-amber-700 font-semibold">ADMIN</p>
          <h1 className="mt-1 text-3xl text-stone-800" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}>
            {COUPLE_EN.bride} &amp; {COUPLE_EN.groom} – Invitation Links
          </h1>
        </header>

        {/* Generator */}
        <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-stone-600">Select Prefix</span>
              <select value={prefix} onChange={(e) => setPrefix(e.target.value as Prefix)} className={inputCls}>
                {PREFIXES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 block sm:col-span-2">
              <span className="text-sm font-semibold text-stone-600">Guest Name</span>
              <input
                type="text"
                placeholder="උදා: සුනිල් පෙරේරා"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={inputCls + ' placeholder:text-stone-400'}
                required
              />
            </label>
          </div>

          {liveDisplayName && (
            <p className="text-sm text-stone-500">
              Greeting preview: <span className="font-semibold text-stone-800">ආදරණීය {liveDisplayName} ❤️</span>
            </p>
          )}

          <button
            type="submit"
            disabled={!liveDisplayName}
            className="w-full bg-[#8C6420] hover:bg-[#7a561b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.99]"
          >
            Generate Link
          </button>
        </form>

        {/* Result */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-600">Generated Link</h2>
          {generated ? (
            <>
              <a href={generated.url} target="_blank" rel="noopener noreferrer" className="block break-all rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-900 text-sm hover:underline">
                {generated.url}
              </a>
              <div>
                <h3 className="text-sm font-semibold text-stone-600 mb-2">Message Preview</h3>
                <pre className="whitespace-pre-wrap break-words rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm text-stone-700 leading-relaxed" style={{ fontFamily: 'inherit' }}>
                  {message}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-400">Fill in the form and click Generate Link.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.url, 'Link copied!')}
              className="py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Copy Link Only
            </button>
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(message, 'Message copied!')}
              className="py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Copy Full Message
            </button>
          </div>
        </section>

        {/* History */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-600 mb-4">Recently Generated</h2>
          {history.length === 0 ? (
            <p className="text-center py-6 text-stone-400 text-sm">No links generated yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/60">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{h.displayName}</p>
                    <p className="text-xs text-stone-500">{h.createdAt.replace(',', '')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleCopy(h.url, 'Link copied!')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700">
                      Link
                    </button>
                    <button type="button" onClick={() => handleCopy(buildInviteMessage(h.displayName, h.url), 'Message copied!')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700">
                      Message
                    </button>
                    <button type="button" onClick={() => handleDelete(h.id)} title="Delete" className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-stone-900 text-white text-sm px-5 py-2.5 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
