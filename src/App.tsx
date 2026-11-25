import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { readGuestName } from "./guest";

const INVITATION = {
  bride: {
    short: "රශ්මි",
    full: "රූපසිංහ යාපා රශ්මි රසාංජි",
    father: "රූපසිංහ යාපා ගාමිනී ලාල් මහතා",
    mother: "යූ. රංජනී වීරසිංහ මහත්මිය",
  },
  groom: {
    short: "තරිඳු",
    full: "සමරසිංහ හෙට්ටිආරච්චිලාගේ තරිඳු සම්පත් හෙට්ටිආරච්චි",
    father: "එස්. එච්. ගාමිනී මහතා",
    mother: "කේ. එල්. රංජනී මහත්මිය",
  },
  date: {
    year: "2027",
    month: "මැයි",
    day: "13",
    weekday: "බ්‍රහස්පතින්දා",
    long: "2027 මැයි මස 13 වන බ්‍රහස්පතින්දා",
    numeric: "13 . 05 . 2027",
    countdownTarget: "2027-05-13T09:05:00+05:30",
  },
  poruwa: "පෙ.ව. 9.05",
  venue: {
    name: "සින්ඩරෙල්ලා හොටෙල්",
    address: "පරකඩුව, ඇහැලියගොඩ",
    mapQuery: "Cinderella Hotel, Parakaduwa, Eheliyagoda, Sri Lanka",
  },
} as const;

const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(INVITATION.venue.mapQuery)}`;
const CALENDAR_LINK =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("රශ්මි සහ තරිඳුගේ විවාහ මංගල්‍යය") +
  "&dates=20270513T033500Z/20270513T093000Z" +
  "&details=" + encodeURIComponent("පෝරුවේ චාරිත්‍රය පෙ.ව. 9.05 ට") +
  "&location=" + encodeURIComponent(INVITATION.venue.mapQuery);

const backgroundMusic = "/jayamangala-gatha.mp3";
// TODO: point this at the Google Apps Script deployment for this couple's RSVP sheet.
const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycbxDGwNwOKyfwZ73x6NsgzhNgOG5mEX4z9dKM1Kqt7V53z_Rw7RGocufZkhG8a-VRW-r/exec";

const GOLD = "#B8913A";
const GOLD_DEEP = "#8E6B22";
const GOLD_SOFT = "#E6D3A3";
const INK = "#4A4032";
const MUTED = "#8A7B62";
const GOLD_GRADIENT = "linear-gradient(170deg, #E2C27A 0%, #C29A45 45%, #8E6B22 100%)";

const MANDALA = "/download__18_-removebg-preview.png";

function Mandala({ size, opacity = 0.9, spin = 60, color = GOLD_GRADIENT }: { size: string; opacity?: number; spin?: number; color?: string }) {
  return (
    <div aria-hidden="true" style={{ width: size, height: size, animation: `spin-slow ${spin}s linear infinite` }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          opacity,
          background: color,
          WebkitMaskImage: `url(${MANDALA})`,
          maskImage: `url(${MANDALA})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </div>
  );
}

function Divider({ light = false }: { light?: boolean }) {
  const c = light ? GOLD_SOFT : GOLD;
  return (
    <div className="mx-auto mt-3 flex w-[150px] items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${c})` }} />
      <svg width="18" height="18" viewBox="0 0 24 24" fill={c}>
        <path d="M12 2c1.2 3.6 3 5.4 6.6 6.6C15 9.8 13.2 11.6 12 15.2 10.8 11.6 9 9.8 5.4 8.6 9 7.4 10.8 5.6 12 2Z" />
        <circle cx="12" cy="19.5" r="1.6" />
      </svg>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${c}, transparent)` }} />
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mb-10 text-center sm:mb-14">
      <span className="mb-2 block text-[0.66rem] uppercase tracking-[0.34em]" style={{ fontFamily: "'Montserrat', sans-serif", color: GOLD }}>
        {kicker}
      </span>
      <h2 className="gold-shimmer font-extrabold leading-tight" style={{ fontSize: "clamp(1.8rem,4.4vw,2.6rem)" }}>
        {title}
      </h2>
      <Divider />
    </Reveal>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Filigree corner ornament; rotate for each corner. */
function Corner({ className, rotate }: { className: string; rotate: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      className={`pointer-events-none absolute h-14 w-14 sm:h-20 sm:w-20 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      stroke={GOLD}
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M4 40 V10 a6 6 0 0 1 6 -6 H40" />
      <path d="M10 46 V16 a6 6 0 0 1 6 -6 H46" opacity="0.5" />
      <path d="M4 4 C18 8 22 14 24 24 C14 22 8 18 4 4 Z" fill={GOLD} fillOpacity="0.18" />
      <path d="M24 24 C30 22 36 26 38 32" />
      <path d="M24 24 C22 30 26 36 32 38" />
      <circle cx="40" cy="4" r="2" fill={GOLD} stroke="none" />
      <circle cx="4" cy="40" r="2" fill={GOLD} stroke="none" />
      <circle cx="40" cy="36" r="1.6" fill={GOLD} stroke="none" />
      <circle cx="34" cy="40" r="1.6" fill={GOLD} stroke="none" />
    </svg>
  );
}



function FloatingPetals() {
  const [petals, setPetals] = useState<
    Array<{ id: number; x: number; size: number; rotation: number; duration: number; delay: number; color: string; drift: number }>
  >([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isMobile = window.innerWidth < 768;
    const colors = ["#D4AF37", "#E9D49A", "#C29A45", "#FFFFFF", "#F3E7C6"];
    setPetals(
      Array.from({ length: isMobile ? 10 : 18 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 7 + 7,
        rotation: Math.random() * 360,
        duration: Math.random() * 11 + 16,
        delay: Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        drift: Math.random() * 24 - 12,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute drop-shadow-[0_2px_8px_rgba(142,107,34,0.35)]"
          style={{ color: p.color }}
          initial={{ x: `${p.x}vw`, y: "-10vh", rotate: p.rotation, opacity: 0 }}
          animate={{ y: "110vh", x: `${p.x + p.drift}vw`, rotate: p.rotation + 540, opacity: [0, 0.9, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2C12,2 10,6 10,10C10,14 12,22 12,22C12,22 14,14 14,10C14,6 12,2 12,2Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function CountdownTimer() {
  const target = new Date(INVITATION.date.countdownTarget).getTime();
  const [left, setLeft] = useState(target - Date.now());

  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  const ms = Math.max(0, left);
  const stats = [
    { label: "දින", value: Math.floor(ms / 86400000) },
    { label: "පැය", value: Math.floor((ms % 86400000) / 3600000) },
    { label: "මිනිත්තු", value: Math.floor((ms % 3600000) / 60000) },
    { label: "තත්පර", value: Math.floor((ms % 60000) / 1000) },
  ];

  return (
    <div className="mx-auto mt-8 flex w-full max-w-3xl justify-center gap-2 px-1 sm:gap-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, type: "spring", stiffness: 80 }}
          className="rounded-t-full p-[1.5px] sm:p-[2px]"
          style={{ background: "linear-gradient(160deg, #EBD397, #B8913A 50%, #8E6B22)", boxShadow: "0 18px 36px -22px rgba(142,107,34,0.6)" }}
        >
          <div className="flex h-[6.5rem] w-[4.5rem] flex-col items-center justify-center rounded-t-full bg-white sm:h-36 sm:w-28" style={{ boxShadow: `inset 0 0 0 4px #FFFFFF, inset 0 0 0 5px ${GOLD_SOFT}` }}>
          <span className="font-numeric mt-3 text-2xl leading-none sm:text-4xl" style={{ color: GOLD_DEEP }}>
            {s.value.toString().padStart(2, "0")}
          </span>
          <span className="mt-2 text-[0.72rem] font-bold sm:text-sm" style={{ color: MUTED }}>
            {s.label}
          </span>
          <span className="mt-1.5 h-1 w-1 rotate-45" style={{ background: GOLD }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const PRE_IMAGES = [
  "WhatsApp Image 2026-11-19 at 19.30.35.jpeg",
  "WhatsApp Image 2026-11-19 at 19.30.32.jpeg",
  "WhatsApp Image 2026-11-19 at 19.30.32 (1).jpeg",
  "WhatsApp Image 2026-11-19 at 19.30.34.jpeg",
  "WhatsApp Image 2026-11-19 at 19.30.30.jpeg",
  "WhatsApp Image 2026-11-19 at 19.30.35 (1).jpeg",
].map((f) => `/pre/${encodeURIComponent(f)}`);

function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const count = PRE_IMAGES.length;
  const step = (d: number) => setActive((i) => (i === null ? i : (i + d + count) % count));

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <section className="relative w-full overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle kicker="Captured Moments" title="සුන්දර මතක" />
      <Reveal className="-mt-6 mb-10 text-center">
        <p className="mx-auto max-w-[40ch] leading-[1.9]" style={{ color: MUTED }}>
          අපගේ ආදර කතාවේ සුන්දර මොහොතවල් කිහිපයක් ඔබ සමඟ බෙදා ගනිමු.
        </p>
      </Reveal>

      <div className="mx-auto max-w-5xl columns-2 gap-3 sm:gap-5 md:columns-3">
        {PRE_IMAGES.map((src, i) => (
          <motion.button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.12 }}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl p-[1.5px] sm:mb-5"
            style={{ background: "linear-gradient(160deg, #EBD397, #B8913A 50%, #F3E7C6)", boxShadow: "0 22px 44px -30px rgba(142,107,34,0.7)" }}
            aria-label={`ඡායාරූපය ${i + 1} විශාල කර බලන්න`}
          >
            <div className="relative overflow-hidden rounded-[14px] bg-white">
              <img src={src} alt="" loading="lazy" className="block w-full transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
              <div className="pointer-events-none absolute inset-2 rounded-[10px] opacity-0 transition-all duration-500 group-hover:inset-3 group-hover:opacity-100" style={{ border: "1px solid rgba(255,255,255,0.85)" }} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#8E6B22]/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: "rgba(28,22,12,0.88)" }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.img
              key={active}
              src={PRE_IMAGES[active]}
              alt=""
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) step(1);
                else if (info.offset.x > 60) step(-1);
              }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[84vh] max-w-full rounded-xl object-contain"
              style={{ border: `2px solid ${GOLD_SOFT}`, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)" }}
            />
            {[
              { d: -1, label: "පෙර", cls: "left-2 sm:left-6", path: "m15 18-6-6 6-6" },
              { d: 1, label: "ඊළඟ", cls: "right-2 sm:right-6", path: "m9 18 6-6-6-6" },
            ].map((b) => (
              <button
                key={b.d}
                type="button"
                aria-label={b.label}
                onClick={(e) => {
                  e.stopPropagation();
                  step(b.d);
                }}
                className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 transition-transform hover:scale-105 ${b.cls}`}
                style={{ color: GOLD_DEEP }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.path} /></svg>
              </button>
            ))}
            <button
              type="button"
              aria-label="වසන්න"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl"
              style={{ color: GOLD_DEEP }}
            >
              ×
            </button>
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-numeric text-sm tracking-[0.3em]" style={{ color: GOLD_SOFT }}>
              {active + 1} / {count}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${GOLD_SOFT}`,
  boxShadow: "0 18px 40px -28px rgba(142,107,34,0.5)",
};

export default function WeddingInvitation() {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = readGuestName();

  const [rsvpForm, setRsvpForm] = useState({ name: guestName ?? "", guests: "1" });
  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement>(null);

  const playMusic = () => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playMusic();
    }
  };

  const [showIntroVideo, setShowIntroVideo] = useState(false);

  const openInvitation = () => {
    setShowIntroVideo(true);
    playMusic();
  };

  const finishIntroVideo = () => {
    setIsOpened(true);
    setShowIntroVideo(false);
  };

  const handleRsvpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rsvpForm.name.trim()) {
      setRsvpStatus("error");
      return;
    }
    setRsvpStatus("sending");
    try {
      const res = await fetch(googleScriptUrl, {
        method: "POST",
        body: new URLSearchParams({ action: "rsvp", name: rsvpForm.name.trim(), guests: rsvpForm.guests, dietaryNotes: "" }),
      });
      if (!res.ok) throw new Error("RSVP failed");
      const result = await res.json().catch(() => null);
      if (result && result.ok === false) throw new Error(result.message || "RSVP failed");
      setRsvpStatus("success");
      setRsvpForm({ name: guestName ?? "", guests: "1" });
    } catch {
      setRsvpStatus("error");
    }
  };

  return (
    <main
      className={`h-[100dvh] w-full bg-white ${isOpened ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"} relative scroll-smooth`}
      style={{ color: INK }}
    >
      <FloatingPetals />

      <AnimatePresence>
        {showIntroVideo && (
          <motion.div
            key="intro-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-white"
          >
            <video
              src="/intro_video.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={finishIntroVideo}
              onError={finishIntroVideo}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={finishIntroVideo}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-5 py-2 text-sm font-bold backdrop-blur-md"
              style={{ color: GOLD_DEEP, border: `1px solid ${GOLD_SOFT}` }}
            >
              මඟ හරින්න ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden"
            style={{ background: "radial-gradient(120% 70% at 50% 45%, #FFFFFF 0%, #FCF9F1 60%, #F6EEDB 100%)" }}
          >
            <div className="flex min-h-full flex-col items-center">
              <div className="pointer-events-none relative w-full shrink-0 overflow-hidden" style={{ height: "calc(0.38 * min(150vw, 760px))" }}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <Mandala size="min(150vw, 760px)" opacity={0.7} />
                </div>
              </div>

              <div className="flex w-full flex-1 items-center justify-center py-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative z-[105] flex flex-col items-center px-6 text-center"
                >
                  <p className="font-bold" style={{ color: GOLD, fontSize: "1rem", letterSpacing: "0.08em" }}>
                    විවාහ මංගල්‍යය
                  </p>
                  <Divider />
                  <h1
                    className="mt-3 font-extrabold"
                    style={{ fontSize: "clamp(2.6rem,11vw,4rem)", lineHeight: 1.15, backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                  >
                    {INVITATION.bride.short}
                    <span className="mx-3 align-middle text-[0.45em]" style={{ color: INK, WebkitTextFillColor: INK }}>සහ</span>
                    {INVITATION.groom.short}
                  </h1>
                  <p className="mt-2 text-[1.1rem]" style={{ color: INK }}>{INVITATION.date.long}</p>

                  {guestName && (
                    <div className="mt-6">
                      <p className="text-sm font-bold" style={{ color: MUTED }}>ආදරණීය</p>
                      <p className="mt-1 font-bold" style={{ color: "#2A241B", fontSize: "clamp(1.2rem,5vw,1.5rem)" }}>{guestName}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={openInvitation}
                    className="mt-7 inline-flex cursor-pointer items-center gap-3 rounded-full px-9 py-3.5 font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #C9A24A, #8E6B22)", color: "#FFFFFF", boxShadow: "0 14px 28px -14px rgba(142,107,34,0.8)", fontSize: "1rem" }}
                  >
                    ආරාධනය විවෘත කරන්න
                  </button>
                </motion.div>
              </div>

              <motion.img
                src="/images/perahera.png"
                alt=""
                aria-hidden="true"
                draggable="false"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
                className="pointer-events-none mt-2 block w-full max-w-[720px] shrink-0 select-none"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div key="site" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="website-shell relative z-20 w-full">
            <button
              onClick={() => setIsOpened(false)}
              className="fixed right-5 top-5 z-50 rounded-full bg-white/85 px-4 py-2.5 text-[0.8rem] font-bold shadow-lg backdrop-blur-md transition-colors hover:bg-white"
              style={{ color: GOLD_DEEP, border: `1px solid ${GOLD_SOFT}` }}
            >
              වසා දමන්න
            </button>

            {/* Hero */}
            <section className="relative overflow-hidden bg-white pb-12">
              <div className="pointer-events-none mx-auto flex justify-center" style={{ marginTop: "calc(-0.5 * min(72vw, 520px))" }}>
                <Mandala size="min(72vw, 520px)" spin={40} />
              </div>

              <div className="relative z-10 mx-auto mt-6 max-w-2xl px-6 text-center sm:px-8">
                <h1
                  className="font-extrabold"
                  style={{ fontSize: "clamp(2.2rem,8.5vw,3.4rem)", lineHeight: 1.3, backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                >
                  සාදර ඇරයුමයි!
                </h1>

                <div className="mt-8 grid grid-cols-2 gap-5 sm:gap-10">
                  {[INVITATION.bride, INVITATION.groom].map((p, i) => (
                    <div key={p.short} className="flex flex-col items-center gap-3">
                      <p className="whitespace-pre-line text-[0.95rem] leading-[1.85] sm:text-base" style={{ color: "#5A4E3B" }}>
                        {`${p.father}\nසහ\n${p.mother}\nයන දෙපළගේ\n${i === 0 ? "ආදරණීය දියණිය" : "ආදරණීය පුත්‍රයා"}`}
                      </p>
                      <p className="mt-auto font-bold leading-snug" style={{ color: GOLD_DEEP, fontSize: "clamp(1.05rem,3.6vw,1.45rem)" }}>
                        {p.full}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="relative mx-auto mt-8 w-[min(80%,360px)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: "190%", height: "128%", background: "radial-gradient(60% 58% at 50% 46%, rgba(246,236,210,0.9) 0%, rgba(246,236,210,0.45) 50%, rgba(255,255,255,0) 80%)" }}
                  />
                  <img src="/Sri_Lankan_Wedding_Couple_Portrait-removebg-preview.png" alt="රශ්මි සහ තරිඳු" loading="eager" draggable="false" className="relative z-[2] w-full select-none" />
                </div>

                <p className="mx-auto mt-6 max-w-[36ch] text-[1.05rem] leading-[1.9]" style={{ color: "#5A4E3B" }}>
                  චාරිත්‍රානුකූලව අතිනත ගැනීමේ ප්‍රීතිය නිමිත්තෙන්
                </p>

                <div className="mt-4">
                  <div className="font-numeric" style={{ fontWeight: 600, color: GOLD_DEEP, fontSize: "clamp(1.3rem,3.4vw,1.8rem)", letterSpacing: "0.18em" }}>
                    {INVITATION.date.year}
                  </div>
                  <div className="mx-auto mt-1.5 flex max-w-md items-center justify-center gap-4 sm:gap-6">
                    <span className="flex-1 py-1.5 text-center font-bold" style={{ color: "#5A4E3B", fontSize: "clamp(1.05rem,2.8vw,1.3rem)", borderTop: `1.5px solid ${GOLD}`, borderBottom: `1.5px solid ${GOLD}` }}>
                      {INVITATION.date.month}
                    </span>
                    <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, color: GOLD_DEEP, fontSize: "clamp(3rem,10vw,4.4rem)", lineHeight: 0.95 }}>
                      {INVITATION.date.day}
                    </span>
                    <span className="flex-1 py-1.5 text-center font-bold" style={{ color: "#5A4E3B", fontSize: "clamp(0.95rem,2.6vw,1.2rem)", borderTop: `1.5px solid ${GOLD}`, borderBottom: `1.5px solid ${GOLD}` }}>
                      {INVITATION.date.weekday}
                    </span>
                  </div>
                  <p className="mt-3 text-[1.05rem] font-bold" style={{ color: GOLD_DEEP }}>
                    පෝරුවේ චාරිත්‍රය {INVITATION.poruwa} ට
                  </p>
                </div>

                <div className="mt-6 flex flex-col items-center gap-1.5">
                  <p className="font-bold" style={{ color: "#5A4E3B", fontSize: "clamp(1.15rem,3vw,1.4rem)" }}>
                    {INVITATION.venue.name}, {INVITATION.venue.address}
                  </p>
                  <p className="max-w-[40ch] text-[1.02rem] leading-[1.85]" style={{ color: "#5A4E3B" }}>
                    හෝටල් පරිශ්‍රයේ දී පැවැත්වෙන මංගල උත්සවයට
                    <br />
                    ඔබට අපි ගෞරවයෙන් ආරාධනා කරන්නෙමු.
                  </p>
                  {guestName && (
                    <p className="mt-3 max-w-[36ch] text-[1rem] leading-[1.85]" style={{ color: "#5A4E3B" }}>
                      <span className="block font-bold" style={{ color: GOLD_DEEP, fontSize: "clamp(1.4rem,5vw,1.8rem)", lineHeight: 1.4 }}>{guestName}</span>
                      අපගේ සුවිශේෂී දිනය අප හා එක්ව සැමරීමට ඔබට සාදරයෙන් ආරාධනා කරමු.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Blessing */}
            <section className="relative w-full overflow-hidden px-6 py-16 sm:py-20" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FBF5E6 100%)" }}>
              <div className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 opacity-[0.12]">
                <Mandala size="280px" spin={80} />
              </div>
              <div className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.12]">
                <Mandala size="280px" spin={80} />
              </div>
              <Reveal className="relative mx-auto max-w-xl text-center">
                <span className="block text-5xl leading-none" style={{ color: GOLD_SOFT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>“</span>
                <p className="mt-2 text-[1.15rem] leading-[2] sm:text-[1.3rem]" style={{ color: "#5A4E3B" }}>
                  ආදරය, විශ්වාසය සහ ගෞරවය අත්තිවාරම් කරගෙන
                  <br />
                  අප දෙදෙනා එක්ව අරඹන මේ නව ජීවන ගමනට
                  <br />
                  <span className="gold-shimmer font-extrabold">ඔබගේ ආශීර්වාදය අපට අගනාම තිළිණයයි.</span>
                </p>
                <Divider />
                <p className="mt-4 text-[0.95rem] font-bold tracking-wide" style={{ color: MUTED }}>
                  — {INVITATION.bride.short} සහ {INVITATION.groom.short} —
                </p>
              </Reveal>
            </section>

            <Gallery />

            {/* Countdown */}
            <section className="gold-pattern relative w-full overflow-hidden px-6 pb-16 pt-14" style={{ borderTop: `1px solid ${GOLD_SOFT}` }}>
              <div className="mx-auto max-w-2xl text-center">
                <SectionTitle kicker="Countdown" title="අපේ සුබ දවස උදා වීමට..." />
                <CountdownTimer />
                <p className="mt-8 text-[1rem] font-bold" style={{ color: MUTED }}>{INVITATION.date.long}</p>
              </div>
            </section>

            {/* Event details */}
            <section className="relative w-full overflow-hidden bg-white px-5 py-16 sm:py-20">
              <SectionTitle kicker="Event Details" title="උත්සව විස්තර" />

              <Reveal className="mx-auto max-w-xl">
                {/* Arched invitation card with a gold gradient edge */}
                <div className="p-[1.5px]" style={{ borderRadius: "240px 240px 26px 26px", background: "linear-gradient(170deg, #EBD397, #B8913A 45%, #F3E7C6 80%, #C29A45)", boxShadow: "0 40px 80px -50px rgba(142,107,34,0.65)" }}>
                  <div className="relative overflow-hidden bg-white px-5 pb-10 pt-16 text-center sm:px-10 sm:pt-20" style={{ borderRadius: "238px 238px 24px 24px" }}>
                    {/* inner hairline arch */}
                    <div className="pointer-events-none absolute inset-2.5" style={{ border: `1px solid ${GOLD_SOFT}`, borderRadius: "230px 230px 18px 18px" }} />
                    <Corner className="bottom-2 left-2" rotate={270} />
                    <Corner className="bottom-2 right-2" rotate={180} />
                    {/* mandala watermark */}
                    <div className="pointer-events-none absolute left-1/2 top-[-140px] -translate-x-1/2 opacity-[0.09]">
                      <Mandala size="360px" spin={90} />
                    </div>

                    <div className="relative">
                      <span className="text-[0.62rem] uppercase tracking-[0.35em]" style={{ fontFamily: "'Montserrat', sans-serif", color: GOLD }}>Save the Date</span>
                      <p className="mt-2 text-[1.1rem] font-bold" style={{ color: "#5A4E3B" }}>{INVITATION.date.weekday}</p>

                      {/* date row */}
                      <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6">
                        <div className="flex flex-col items-center">
                          <span className="font-bold" style={{ color: "#5A4E3B", fontSize: "clamp(1.1rem,4vw,1.35rem)" }}>{INVITATION.date.month}</span>
                          <span className="mt-1 h-px w-12" style={{ background: GOLD }} />
                        </div>
                        <div className="relative grid h-24 w-24 place-items-center sm:h-28 sm:w-28">
                          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                            <circle cx="50" cy="50" r="47" fill="none" stroke={GOLD} strokeWidth="1.2" />
                            <circle cx="50" cy="50" r="42" fill="#FCF6E6" stroke={GOLD_SOFT} strokeWidth="0.8" strokeDasharray="1.5 3" />
                          </svg>
                          <span className="gold-shimmer relative" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "clamp(2.8rem,10vw,3.6rem)", lineHeight: 1 }}>
                            {INVITATION.date.day}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="font-numeric font-semibold tracking-[0.15em]" style={{ color: "#5A4E3B", fontSize: "clamp(1.1rem,4vw,1.35rem)" }}>{INVITATION.date.year}</span>
                          <span className="mt-1 h-px w-12" style={{ background: GOLD }} />
                        </div>
                      </div>

                      <Divider />

                      {/* ceremony + venue */}
                      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-6">
                        {[
                          { icon: <Clock className="h-5 w-5" />, title: "පෝරුවේ චාරිත්‍රය", main: INVITATION.poruwa, sub: "සුබ නැකතට" },
                          null,
                          { icon: <MapPin className="h-5 w-5" />, title: "උත්සව ස්ථානය", main: INVITATION.venue.name, sub: INVITATION.venue.address },
                        ].map((c, i) =>
                          c === null ? (
                            <div key="sep" className="flex h-full flex-col items-center" aria-hidden="true">
                              <span className="w-px flex-1" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)` }} />
                              <span className="my-1.5 h-2 w-2 rotate-45" style={{ background: GOLD }} />
                              <span className="w-px flex-1" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)` }} />
                            </div>
                          ) : (
                            <motion.div
                              key={c.title}
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
                              className="flex flex-col items-center gap-1.5"
                            >
                              <span className="mb-1 grid h-12 w-12 place-items-center rounded-full text-white" style={{ background: "linear-gradient(150deg, #E2C27A, #B8913A 55%, #8E6B22)", boxShadow: `0 0 0 4px #FFFFFF, 0 0 0 5px ${GOLD_SOFT}` }}>
                                {c.icon}
                              </span>
                              <span className="text-[0.9rem] font-bold" style={{ color: MUTED }}>{c.title}</span>
                              <span className="font-extrabold leading-snug" style={{ color: GOLD_DEEP, fontSize: "clamp(1.05rem,3.8vw,1.3rem)" }}>{c.main}</span>
                              <span className="text-[0.92rem] leading-snug" style={{ color: "#5A4E3B" }}>{c.sub}</span>
                            </motion.div>
                          )
                        )}
                      </div>


                      {/* actions */}
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <a
                          href={CALENDAR_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
                          style={{ background: "linear-gradient(135deg, #C9A24A, #8E6B22)", boxShadow: "0 14px 26px -14px rgba(142,107,34,0.8)" }}
                        >
                          <Calendar className="h-4 w-4" /> දිනය සුරකින්න
                        </a>
                        <a
                          href={MAP_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
                          style={{ color: GOLD_DEEP, border: `1px solid ${GOLD}` }}
                        >
                          <MapPin className="h-4 w-4" /> මඟ පෙන්වීම
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Venue */}
            <section className="gold-pattern w-full px-6 py-14 sm:py-16" style={{ borderTop: `1px solid ${GOLD_SOFT}` }}>
              <SectionTitle kicker="Location" title="උත්සව ස්ථානය" />
              <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-[0.85fr_1.15fr]">
                <div className="flex flex-col items-center justify-center gap-2 rounded-3xl px-8 py-10 text-center" style={cardStyle}>
                  <span className="text-[0.62rem] uppercase tracking-[0.3em]" style={{ fontFamily: "'Montserrat', sans-serif", color: GOLD }}>Venue</span>
                  <h3 className="font-bold" style={{ color: GOLD_DEEP, fontSize: "1.45rem" }}>{INVITATION.venue.name}</h3>
                  <p className="text-[1.05rem]" style={{ color: MUTED }}>{INVITATION.venue.address}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl" style={{ border: `1px solid ${GOLD_SOFT}`, boxShadow: "0 28px 56px -34px rgba(142,107,34,0.5)" }}>
                    <iframe
                      title="සින්ඩරෙල්ලා හොටෙල් සිතියම"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(INVITATION.venue.mapQuery)}&z=14&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                  <a
                    href={MAP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 self-center rounded-full px-7 py-3 font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #C9A24A, #8E6B22)", boxShadow: "0 14px 26px -14px rgba(142,107,34,0.8)" }}
                  >
                    <MapPin className="h-4 w-4" /> සිතියමෙන් බලන්න
                  </a>
                </div>
              </div>
            </section>

            {/* RSVP */}
            <section id="rsvp" className="w-full bg-white px-6 py-14 sm:py-16">
              <div className="mx-auto max-w-xl text-center">
                <SectionTitle kicker="RSVP" title="පැමිණීම දන්වන්න" />
                <p className="mx-auto -mt-4 mb-9 max-w-[44ch] leading-[1.85]" style={{ color: MUTED }}>
                  ඔබගේ පැමිණීම අපට මහත් සතුටකි. කරුණාකර කලින් දන්වන්න.
                </p>

                <form onSubmit={handleRsvpSubmit} className="rounded-[120px_120px_22px_22px] px-6 pb-10 pt-16 text-left sm:px-12 sm:pt-20" style={{ ...cardStyle, background: "#FFFDF8" }}>
                  <div className="mb-5 flex flex-col gap-1.5">
                    <label htmlFor="rsvp-name" className="font-bold" style={{ color: GOLD_DEEP }}>සම්පූර්ණ නම</label>
                    <input
                      id="rsvp-name"
                      type="text"
                      required
                      placeholder="ඔබගේ නම"
                      className="w-full rounded-[10px] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A24A]/40"
                      style={{ border: `1px solid ${GOLD_SOFT}`, color: INK }}
                      value={rsvpForm.name}
                      onChange={(e) => {
                        setRsvpStatus("idle");
                        setRsvpForm((p) => ({ ...p, name: e.target.value }));
                      }}
                    />
                  </div>

                  <div className="mb-6">
                    <p className="mb-2.5 font-bold" style={{ color: GOLD_DEEP }}>සහභාගි වෙනවාද?</p>
                    <div className="flex gap-3">
                      {[
                        { v: "1", label: "සතුටින් සහභාගි වෙමි", active: rsvpForm.guests !== "0" },
                        { v: "0", label: "සහභාගි විය නොහැක", active: rsvpForm.guests === "0" },
                      ].map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => {
                            setRsvpStatus("idle");
                            setRsvpForm((p) => ({ ...p, guests: o.v }));
                          }}
                          className="flex-1 rounded-[10px] px-3 py-3.5 text-center font-bold transition-colors"
                          style={{
                            border: `1px solid ${GOLD_SOFT}`,
                            background: o.active ? "linear-gradient(135deg, #C9A24A, #8E6B22)" : "transparent",
                            color: o.active ? "#FFFFFF" : MUTED,
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(rsvpStatus === "success" || rsvpStatus === "error") && (
                    <p className={`mb-4 text-center text-sm font-bold ${rsvpStatus === "success" ? "text-emerald-700" : "text-red-600"}`}>
                      {rsvpStatus === "success"
                        ? "ඔබගේ පිළිතුර සාර්ථකව යවා ඇත. ස්තූතියි!"
                        : "කරුණාකර ඔබගේ නම ඇතුළත් කර නැවත උත්සාහ කරන්න."}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={rsvpStatus === "sending"}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-[1.05rem] font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #C9A24A, #8E6B22)", boxShadow: "0 14px 30px -12px rgba(142,107,34,0.7)" }}
                  >
                    {rsvpStatus === "sending" ? "යවමින්..." : "පිළිතුර යවන්න"}
                  </button>
                </form>
              </div>
            </section>

            {/* Footer */}
            <section className="relative w-full overflow-hidden">
              <div className="relative px-6 py-12 text-center text-white" style={{ background: "linear-gradient(180deg, #B8913A 0%, #8E6B22 100%)" }}>
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
                  <Mandala size="420px" opacity={1} spin={90} color="#FFFFFF" />
                </div>
                <div className="relative z-10">
                  <div className="text-[0.7rem] uppercase tracking-[0.4em] opacity-85" style={{ fontFamily: "'Montserrat', sans-serif" }}>Save the date</div>
                  <div className="my-3.5" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: "clamp(2.4rem,9vw,5rem)", lineHeight: 1, letterSpacing: "0.04em" }}>
                    13 . 05 . 27
                  </div>
                  <div className="text-[1.6rem] font-extrabold">{INVITATION.bride.short} සහ {INVITATION.groom.short}</div>                  <Divider light />
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} src={backgroundMusic} loop />

      <button
        onClick={toggleMusic}
        aria-label={isPlaying ? "සංගීතය නවත්වන්න" : "සංගීතය වාදනය කරන්න"}
        className="fixed bottom-6 right-6 z-[120] rounded-full bg-white p-3 shadow-lg transition-colors hover:bg-[#FCF9F1]"
        style={{ color: GOLD_DEEP, border: `1px solid ${GOLD_SOFT}` }}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </main>
  );
}
