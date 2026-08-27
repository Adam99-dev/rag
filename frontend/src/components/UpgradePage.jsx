import { useCallback, useEffect, useRef, useState } from "react";
import { getStripe, isStripeConfigured } from "../lib/stripe";
import { paymentApi } from "../api/payment.api";
import { theme } from "../theme";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto+Mono:wght@500;600&display=swap";
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@500;600&display=swap";

const ELEMENT_BASE = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: "15px",
  fontWeight: "500",
  color: "#1c1917",
  letterSpacing: "0.01em",
  "::placeholder": { color: "#a8a29e" },
};
const NUMBER_STYLE = {
  base: {
    ...ELEMENT_BASE,
    fontFamily: "'Roboto Mono', ui-monospace, monospace",
    letterSpacing: "0.04em",
  },
  invalid: { color: "#b91c1c", iconColor: "#b91c1c" },
};
const REST_STYLE = {
  base: ELEMENT_BASE,
  invalid: { color: "#b91c1c", iconColor: "#b91c1c" },
};

const schemeKeyFromBrand = (brand) =>
  ["visa", "mastercard", "amex", "discover"].includes(brand) ? brand : "";

const brandLabel = (brand) =>
  ({
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
  })[brand] || "Card";

const groupsFor = (schemeKey) =>
  schemeKey === "amex" ? [4, 6, 5] : [4, 4, 4, 4];

const nameFace = (value) =>
  value.trim() ? value.trim().toUpperCase() : "YOUR NAME";

const ErrIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="w-3.5 h-3.5 shrink-0"
    aria-hidden
    focusable="false"
  >
    <circle
      cx="8"
      cy="8"
      r="6.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 4.9v3.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11.1" r=".95" fill="currentColor" />
  </svg>
);

const FieldIcon = ({ children }) => (
  <svg
    viewBox="0 0 20 20"
    className="w-4 h-4 shrink-0 stroke-stone-400 group-focus-within:stroke-stone-700"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    focusable="false"
  >
    {children}
  </svg>
);

/* ─── already-Pro screen ─── */
function AlreadyPro({ onBack }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-auto font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif] text-stone-800 antialiased"
      style={{ background: theme.bg }}
    >
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center gap-6 p-5 sm:p-10">
        <section
          className="w-full max-w-md overflow-hidden"
          style={{ ...theme.panel, borderRadius: "20px" }}
        >
          <div className="flex flex-col items-center gap-2.5 p-8 sm:p-10 text-center">
            <span
              className="inline-grid place-items-center px-3.5 py-1.5 mb-1.5 rounded-full text-[0.68rem] font-extrabold tracking-[0.18em] text-white"
              style={{
                ...theme.primary,
                boxShadow: "0 8px 20px -8px rgba(59,130,246,0.45)",
              }}
            >
              PRO
            </span>
            <h2 className="m-0 text-2xl font-extrabold tracking-tight text-stone-800">
              You&apos;re on Pro
            </h2>
            <p className="m-0 mb-2 text-sm text-stone-500">
              You already have access to all Premium features.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-2 w-full max-w-[220px] h-12 rounded-[14px] font-bold text-white transition hover:-translate-y-0.5"
              style={{
                ...theme.primary,
                boxShadow:
                  "0 8px 28px rgba(59,130,246,0.32), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              Back to app
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─── scheme mark ─── */
function SchemeMark({ scheme, className = "" }) {
  if (!scheme) return <span className={`block w-11 h-4 ${className}`} />;
  if (scheme === "mastercard") {
    return (
      <span className={`relative block w-11 h-4 ${className}`}>
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_calc(50%-6px)_50%,#eb001b_0_8px,transparent_8px),radial-gradient(circle_at_calc(50%+6px)_50%,#f79e1b_0_8px,transparent_8px)] bg-blend-multiply" />
      </span>
    );
  }
  const labels = { visa: "VISA", amex: "AMEX", discover: "DISCOVER" };
  return (
    <span
      className={`block w-11 h-4 grid place-items-center justify-end italic font-extrabold text-[0.82rem] uppercase tracking-wide ${
        scheme === "discover" ? "text-[0.58rem] tracking-wider" : ""
      } ${className}`}
    >
      {labels[scheme] || ""}
    </span>
  );
}

/* ─── main component ─── */
const UpgradePage = ({ onBack, onSuccess, user }) => {
  const alreadyPro = String(user?.plan || "").toUpperCase() === "PREMIUM";

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [cvcFocused, setCvcFocused] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [complete, setComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });
  const [phase, setPhase] = useState("idle");
  const [verdict, setVerdict] = useState({ say: "", sub: "" });

  const stripeRef = useRef(null);
  const numElRef = useRef(null);
  const expElRef = useRef(null);
  const cvcElRef = useRef(null);
  const numberMountRef = useRef(null);
  const expiryMountRef = useRef(null);
  const cvcMountRef = useRef(null);
  const stageRef = useRef(null);
  const slotRef = useRef(null);
  const cardRef = useRef(null);
  const tiltRef = useRef(null);
  const panesRef = useRef(null);
  const resultRef = useRef(null);
  const nameInputRef = useRef(null);
  const againBtnRef = useRef(null);

  const phaseRef = useRef("idle");
  const mountedRef = useRef(true);
  const chargedRef = useRef(null);
  const doneRef = useRef(false);
  const successTimerRef = useRef(null);

  const schemeKey = schemeKeyFromBrand(brand);
  const flipped = cvcFocused && schemeKey !== "amex";
  const processing = phase === "authorising";
  const payDisabled = Boolean(loadError) || !ready || processing;
  const isActive = phase !== "idle";

  const layFlight = useCallback(() => {
    const slot = slotRef.current;
    const cardEl = cardRef.current;
    const panes = panesRef.current;
    const stage = stageRef.current;
    const res = resultRef.current;
    if (!slot || !cardEl || !panes || !stage) return;

    const stacked = window.matchMedia("(max-width: 860px)").matches;
    const from = slot.getBoundingClientRect();
    const target = (stacked ? stage : panes).getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    if (!from.width || !target.width) return;

    const grow = Math.min(
      1.34,
      Math.max(1, (target.width * 0.44) / from.width),
    );
    const flownH = from.height * grow;
    const cx = target.left + target.width / 2;
    const cy = target.top + target.height / 2 - flownH * 0.18;

    cardEl.style.setProperty(
      "--fly-x",
      `${(cx - (from.left + from.width / 2)).toFixed(1)}px`,
    );
    cardEl.style.setProperty(
      "--fly-y",
      `${(cy - (from.top + from.height / 2)).toFixed(1)}px`,
    );
    cardEl.style.setProperty("--fly-s", grow.toFixed(3));

    if (res) {
      res.style.setProperty(
        "--result-x",
        `${(cx - (stageRect.left + stageRect.width / 2)).toFixed(1)}px`,
      );
      res.style.setProperty(
        "--verdict-y",
        `${(cy + flownH / 2 + 26 - (stageRect.top + stageRect.height / 2)).toFixed(1)}px`,
      );
    }
  }, []);

  const land = useCallback(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;
    cardEl.style.removeProperty("--fly-x");
    cardEl.style.removeProperty("--fly-y");
    cardEl.style.removeProperty("--fly-s");
  }, []);

  const finishSuccess = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    onSuccess?.(chargedRef.current);
  }, [onSuccess]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (document.getElementById("sable-fonts")) return;
    const link = document.createElement("link");
    link.id = "sable-fonts";
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (alreadyPro) return undefined;
    if (!isStripeConfigured) {
      setLoadError(
        "Payments aren't configured yet. Set VITE_STRIPE_PUBLISHABLE_KEY in the frontend .env.",
      );
      return undefined;
    }

    let cancelled = false;
    let numberEl, expiryEl, cvcEl;

    (async () => {
      const stripe = await getStripe();
      if (cancelled) return;
      if (!stripe) {
        setLoadError("Unable to load the secure payment fields. Please retry.");
        return;
      }

      stripeRef.current = stripe;
      const elements = stripe.elements({ fonts: [{ cssSrc: FONT_CSS }] });

      numberEl = elements.create("cardNumber", {
        showIcon: false,
        placeholder: "4242 4242 4242 4242",
        style: NUMBER_STYLE,
      });
      expiryEl = elements.create("cardExpiry", { style: REST_STYLE });
      cvcEl = elements.create("cardCvc", {
        placeholder: "CVC",
        style: REST_STYLE,
      });
      if (cancelled) return;

      numberMountRef.current && numberEl.mount(numberMountRef.current);
      expiryMountRef.current && expiryEl.mount(expiryMountRef.current);
      cvcMountRef.current && cvcEl.mount(cvcMountRef.current);
      numElRef.current = numberEl;
      expElRef.current = expiryEl;
      cvcElRef.current = cvcEl;

      numberEl.on("ready", () => !cancelled && setReady(true));
      numberEl.on("change", (e) => {
        if (cancelled) return;
        setBrand(e.brand && e.brand !== "unknown" ? e.brand : "");
        setComplete((c) => ({ ...c, number: e.complete }));
        setErrors((er) => ({ ...er, number: e.error?.message || "" }));
      });
      expiryEl.on("change", (e) => {
        if (cancelled) return;
        setComplete((c) => ({ ...c, expiry: e.complete }));
        setErrors((er) => ({ ...er, expiry: e.error?.message || "" }));
      });
      cvcEl.on("change", (e) => {
        if (cancelled) return;
        setComplete((c) => ({ ...c, cvc: e.complete }));
        setErrors((er) => ({ ...er, cvc: e.error?.message || "" }));
      });
      cvcEl.on("focus", () => !cancelled && setCvcFocused(true));
      cvcEl.on("blur", () => !cancelled && setCvcFocused(false));
    })();

    return () => {
      cancelled = true;
      numberEl?.destroy();
      expiryEl?.destroy();
      cvcEl?.destroy();
      numElRef.current = null;
      expElRef.current = null;
      cvcElRef.current = null;
    };
  }, [alreadyPro]);

  useEffect(() => {
    if (alreadyPro) return undefined;
    const onResize = () => phaseRef.current !== "idle" && layFlight();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [alreadyPro, layFlight]);

  useEffect(() => {
    if (alreadyPro) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    const stage = stageRef.current;
    const cardEl = cardRef.current;
    const tiltEl = tiltRef.current;
    if (!stage || !cardEl || !tiltEl) return undefined;

    const aim = { x: 0, y: 0, tx: 0, ty: 0 };
    let frame = null;
    let zone = null;
    const clampN = (n, a, b) => Math.min(b, Math.max(a, n));
    const measureZone = () => {
      zone = stage.getBoundingClientRect();
    };

    const pump = () => {
      aim.x += (aim.tx - aim.x) * 0.14;
      aim.y += (aim.ty - aim.y) * 0.14;
      const rest = Math.abs(aim.tx - aim.x) + Math.abs(aim.ty - aim.y) < 0.002;
      if (rest) {
        aim.x = aim.tx;
        aim.y = aim.ty;
      }
      cardEl.style.setProperty("--px", aim.x.toFixed(3));
      cardEl.style.setProperty("--py", aim.y.toFixed(3));
      tiltEl.style.setProperty("--tx", `${(-aim.y * 9).toFixed(2)}deg`);
      tiltEl.style.setProperty("--ty", `${(aim.x * 13).toFixed(2)}deg`);
      if (rest) {
        frame = null;
        tiltEl.style.willChange = "";
      } else {
        frame = requestAnimationFrame(pump);
      }
    };

    const aimAt = (x, y) => {
      if (!zone?.width) measureZone();
      aim.tx = clampN(
        (x - (zone.left + zone.width / 2)) / (zone.width / 2),
        -1,
        1,
      );
      aim.ty = clampN(
        (y - (zone.top + zone.height / 2)) / (zone.height / 2),
        -1,
        1,
      );
      if (!frame) {
        tiltEl.style.willChange = "transform";
        frame = requestAnimationFrame(pump);
      }
    };
    const relax = () => {
      aim.tx = 0;
      aim.ty = 0;
      if (!frame) {
        tiltEl.style.willChange = "transform";
        frame = requestAnimationFrame(pump);
      }
    };

    const onMove = (e) =>
      e.pointerType === "mouse" && aimAt(e.clientX, e.clientY);
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", relax, { passive: true });
    window.addEventListener("resize", measureZone, { passive: true });
    window.addEventListener("scroll", measureZone, { passive: true });
    measureZone();

    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", relax);
      window.removeEventListener("resize", measureZone);
      window.removeEventListener("scroll", measureZone);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [alreadyPro]);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "idle") {
      land();
      return undefined;
    }
    const id = requestAnimationFrame(() => layFlight());
    return () => cancelAnimationFrame(id);
  }, [phase, layFlight, land]);

  useEffect(() => {
    if (phase !== "approved" && phase !== "declined") return undefined;
    const t = setTimeout(() => againBtnRef.current?.focus?.(), 560);
    return () => clearTimeout(t);
  }, [phase]);

  const resetToIdle = () => {
    setPhase("idle");
    land();
    setVerdict({ say: "", sub: "" });
    requestAnimationFrame(() => numElRef.current?.focus?.());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (phaseRef.current !== "idle") return;

    const stripe = stripeRef.current;
    const numberEl = numElRef.current;
    if (!stripe || !numberEl || loadError) return;

    const nameOk = name.trim().length >= 2;
    setErrors({
      name: nameOk ? "" : "Enter the name printed on the card.",
      number: complete.number ? "" : errors.number || "Enter your card number.",
      expiry: complete.expiry ? "" : errors.expiry || "Enter the expiry date.",
      cvc: complete.cvc ? "" : errors.cvc || "Enter the security code.",
    });
    if (!nameOk) return nameInputRef.current?.focus();
    if (!complete.number) return numberEl.focus?.();
    if (!complete.expiry) return expElRef.current?.focus?.();
    if (!complete.cvc) return cvcElRef.current?.focus?.();

    const label = brandLabel(brand);
    setCvcFocused(false);
    setVerdict({
      say: "Authorising with your bank",
      sub: `${label} · ₹599.00`,
    });
    phaseRef.current = "authorising";
    setPhase("authorising");

    const startedAt = Date.now();
    const minDwell = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 350
      : 1400;
    const settle = async () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed < minDwell)
        await new Promise((r) => setTimeout(r, minDwell - elapsed));
    };

    try {
      const { token, error } = await stripe.createToken(numberEl, {
        name: name.trim(),
      });
      if (error) throw new Error(error.message);

      const added = await paymentApi.addCard({ card_token: token.id });
      const cardId = added?.data?.card_id;
      if (!cardId)
        throw new Error(added?.message || "Could not save the card.");

      const charged = await paymentApi.createCharge({ card_id: cardId });
      chargedRef.current = charged;

      await settle();
      if (!mountedRef.current) return;

      const last4 =
        charged?.data?.payment_method?.last4 || token.card?.last4 || "";
      setVerdict({
        say: "Paid ₹599.00",
        sub: last4
          ? `${label} •••• ${last4} · receipt on its way`
          : "Receipt on its way to you",
      });
      setPhase("approved");

      doneRef.current = false;
      successTimerRef.current = setTimeout(
        finishSuccess,
        minDwell === 350 ? 400 : 1600,
      );
    } catch (err) {
      await settle();
      if (!mountedRef.current) return;
      setVerdict({
        say: "Your bank declined this card",
        sub: err.message || "No money has moved. Try another card.",
      });
      setPhase("declined");
    }
  };

  if (alreadyPro) return <AlreadyPro onBack={onBack} />;

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif] text-stone-800 antialiased selection:bg-blue-500/20 selection:text-stone-900"
      style={{ background: theme.bg }}
    >
      <style>{`
        @keyframes sable-spin { to { transform: rotate(360deg); } }
        @keyframes sable-sweep {
          0%   { transform: translate3d(0,0,0) rotate(14deg); opacity: 0; }
          22%  { opacity: 1; }
          78%  { opacity: 1; }
          100% { transform: translate3d(340%,0,0) rotate(14deg); opacity: 0; }
        }
        @keyframes sable-glow-breathe {
          0%,100% { opacity: .6; transform: scale(.99); }
          50%     { opacity: 1; transform: scale(1.02); }
        }
        @keyframes sable-draw {
          from { stroke-dasharray: 1; stroke-dashoffset: 1; }
          to   { stroke-dasharray: 1; stroke-dashoffset: 0; }
        }
        @keyframes sable-shake {
          0%,100% { transform: rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) translateX(0); }
          18% { transform: rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) translateX(-11px); }
          38% { transform: rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) translateX(9px); }
          58% { transform: rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) translateX(-6px); }
          78% { transform: rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) translateX(3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sable-anim, .sable-anim * {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .001ms !important;
          }
        }
      `}</style>

      <div className="relative z-10 min-h-full flex flex-col items-center justify-center gap-4 sm:gap-7 p-4 sm:p-8">
        <section
          className={`relative w-full max-w-[1080px] overflow-hidden text-stone-800 ${
            isActive ? "max-md:pb-36" : ""
          }`}
          style={{
            ...theme.panel,
            borderRadius: "20px",
            ...(isActive
              ? { background: "linear-gradient(145deg, #f5f2ed, #ebe6df)" }
              : {}),
          }}
          data-phase={phase}
        >
          <div
            ref={panesRef}
            className="relative grid grid-cols-1 md:grid-cols-[1.02fr_1fr] min-h-0 md:min-h-[486px]"
          >
            {/* divider */}
            <div
              className={`hidden md:block absolute top-0 bottom-0 left-[calc(1.02/2.02*100%)] w-px z-[2] transition-opacity duration-300 ${
                isActive ? "opacity-0" : "opacity-100"
              }`}
              style={{ background: "rgba(0,0,0,0.06)" }}
            />

            {/* stage wash */}
            <div
              className={`absolute inset-0 z-[1] pointer-events-none transition-opacity duration-500 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background: "linear-gradient(145deg, #f0ebe3, #e8e4de)",
              }}
            />

            {/* ── LEFT: card + order + verdict ── */}
            <div
              ref={stageRef}
              className="relative z-[2] flex flex-col items-center justify-center gap-5 md:gap-6 p-5 md:p-8"
              style={{
                background:
                  "linear-gradient(168deg, #f5f2ed 0%, #ebe6df 50%, #e0dbd3 100%)",
              }}
            >
              {/* card slot */}
              <div
                ref={slotRef}
                className="relative z-[4] w-[min(360px,90%)] aspect-[1.586]"
                aria-hidden
              >
                <div
                  ref={cardRef}
                  className="absolute inset-0 perspective-[1300px] transition-transform duration-[920ms] ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{
                    transform:
                      "translate3d(var(--fly-x,0px),var(--fly-y,0px),0) scale(var(--fly-s,1))",
                  }}
                >
                  {/* glows */}
                  <span
                    className={`absolute inset-0 rounded-[20px] pointer-events-none -z-10 transition-all duration-500 ${
                      phase === "authorising"
                        ? "opacity-100 scale-100 animate-[sable-glow-breathe_1.25s_ease-in-out_infinite] shadow-[0_0_0_2px_rgba(59,130,246,.4),0_0_26px_4px_rgba(59,130,246,.45),0_0_62px_18px_rgba(59,130,246,.28)]"
                        : "opacity-0 scale-[.97]"
                    }`}
                  />
                  <span
                    className={`absolute inset-0 rounded-[20px] pointer-events-none -z-10 transition-all duration-500 ${
                      phase === "approved"
                        ? "opacity-100 scale-[1.01] shadow-[0_0_0_2px_rgba(22,163,74,.4),0_0_26px_4px_rgba(34,197,94,.5),0_0_62px_18px_rgba(34,197,94,.28)]"
                        : "opacity-0 scale-[.97]"
                    }`}
                  />
                  <span
                    className={`absolute inset-0 rounded-[20px] pointer-events-none -z-10 transition-all duration-500 ${
                      phase === "declined"
                        ? "opacity-100 scale-[1.01] shadow-[0_0_0_2px_rgba(185,28,28,.42),0_0_26px_4px_rgba(239,68,68,.5),0_0_62px_18px_rgba(239,68,68,.28)]"
                        : "opacity-0 scale-[.97]"
                    }`}
                  />

                  <div
                    ref={tiltRef}
                    className={`absolute inset-0 [transform-style:preserve-3d] ${
                      phase === "declined"
                        ? "animate-[sable-shake_.5s_ease_both]"
                        : ""
                    }`}
                    style={{
                      transform:
                        "rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg))",
                    }}
                  >
                    <div
                      className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-[780ms] ease-[cubic-bezier(.34,1.28,.48,1)]"
                      style={{
                        transform: flipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                      }}
                    >
                      {/* FRONT */}
                      <div
                        className={`absolute inset-0 rounded-[20px] overflow-hidden [backface-visibility:hidden] p-[clamp(15px,4.6%,22px)] flex flex-col text-stone-800 ${
                          phase === "approved"
                            ? "shadow-[0_1px_0_rgba(255,255,255,.95)_inset,0_0_0_1.5px_rgba(22,163,74,.5)_inset,0_20px_40px_-18px_rgba(22,101,52,.35)]"
                            : phase === "declined"
                              ? "shadow-[0_1px_0_rgba(255,255,255,.95)_inset,0_0_0_1.5px_rgba(185,28,28,.5)_inset,0_20px_40px_-18px_rgba(127,29,29,.3)]"
                              : "shadow-[0_1px_0_rgba(255,255,255,.95)_inset,0_0_0_1px_rgba(0,0,0,.06)_inset,0_20px_40px_-18px_rgba(0,0,0,.18)]"
                        }`}
                        style={{
                          background:
                            "linear-gradient(122deg, #fdfaf5 0%, #f5f2ed 22%, #ebe6df 42%, #e0dbd3 60%, #d4cfc8 79%, #c8c2b8 100%)",
                        }}
                      >
                        <span className="absolute inset-0 pointer-events-none bg-[radial-gradient(64%_80%_at_98%_2%,rgba(59,130,246,.18),transparent_60%),radial-gradient(58%_74%_at_112%_96%,rgba(147,197,253,.2),transparent_62%)]" />
                        <span
                          className="absolute -left-[55%] -top-[75%] w-[210%] h-[250%] pointer-events-none opacity-70 bg-[radial-gradient(closest-side,rgba(255,255,255,.7),rgba(255,255,255,.2)_44%,transparent_70%)]"
                          style={{
                            transform:
                              "translate3d(calc(var(--px,0)*15%),calc(var(--py,0)*12%),0)",
                          }}
                        />
                        <span
                          className={`absolute -top-[30%] -bottom-[30%] -left-[40%] w-[34%] pointer-events-none bg-[linear-gradient(96deg,transparent,rgba(255,255,255,.9),transparent)] ${
                            phase === "authorising"
                              ? "opacity-100 animate-[sable-sweep_1.35s_ease_.18s_infinite]"
                              : "opacity-0"
                          }`}
                        />

                        <div className="relative z-[1] flex items-center gap-3">
                          <svg
                            className="w-[clamp(37px,13%,46px)] h-auto shrink-0 drop-shadow-sm"
                            viewBox="0 0 44 34"
                            focusable="false"
                          >
                            <defs>
                              <linearGradient
                                id="sable-steel"
                                x1=".05"
                                y1="0"
                                x2=".95"
                                y2="1"
                              >
                                <stop offset="0" stopColor="#faf8f5" />
                                <stop offset=".34" stopColor="#e8e4de" />
                                <stop offset=".68" stopColor="#c8c2b8" />
                                <stop offset="1" stopColor="#a8a29e" />
                              </linearGradient>
                            </defs>
                            <rect
                              x=".7"
                              y=".7"
                              width="42.6"
                              height="32.6"
                              rx="5.4"
                              fill="url(#sable-steel)"
                            />
                            <path
                              d="M6 1.2h32.4a4.8 4.8 0 0 1 4.8 4.8"
                              fill="none"
                              stroke="rgba(255,255,255,.75)"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
                            <path
                              d="M1.2 6v22a4.8 4.8 0 0 0 4.8 4.8h32"
                              fill="none"
                              stroke="rgba(0,0,0,.2)"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                            <rect
                              x=".7"
                              y=".7"
                              width="42.6"
                              height="32.6"
                              rx="5.4"
                              fill="none"
                              stroke="rgba(0,0,0,.25)"
                              strokeWidth="1"
                            />
                            <g
                              stroke="rgba(0,0,0,.3)"
                              strokeWidth="1.25"
                              fill="none"
                              strokeLinecap="round"
                            >
                              <path d="M14.2 1.4v31.2M29.8 1.4v31.2" />
                              <path d="M1.4 11.6h12.8M29.8 11.6h12.8M1.4 22.4h12.8M29.8 22.4h12.8" />
                            </g>
                            <rect
                              x="14.2"
                              y="11.6"
                              width="15.6"
                              height="10.8"
                              rx="2"
                              fill="rgba(255,255,255,.35)"
                              stroke="rgba(0,0,0,.3)"
                              strokeWidth="1.25"
                            />
                          </svg>
                          <svg
                            className="w-4 h-auto shrink-0 fill-none stroke-stone-500/60"
                            viewBox="0 0 20 22"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            focusable="false"
                          >
                            <path d="M4 4.4a10 10 0 0 1 0 13.2M8.6 1.6a15.5 15.5 0 0 1 0 18.8M.4 7.6a5 5 0 0 1 0 6.8" />
                          </svg>
                          <span className="ml-auto flex flex-col items-end">
                            <span className="text-[0.82rem] font-extrabold tracking-[0.16em] text-blue-600 drop-shadow-sm">
                              DocuMind
                            </span>
                          </span>
                        </div>

                        <p className="relative z-[1] my-auto flex gap-[clamp(9px,3.4%,16px)] font-mono font-semibold text-[clamp(.95rem,2.5vw,1.16rem)] tracking-wider text-stone-800">
                          {groupsFor(schemeKey).map((n, gi) => (
                            <span key={gi} className="flex">
                              {Array.from({ length: n }).map((_, ci) => (
                                <span
                                  key={ci}
                                  className="inline-block min-w-[0.62em] text-center text-stone-400"
                                >
                                  •
                                </span>
                              ))}
                            </span>
                          ))}
                        </p>

                        <div className="relative z-[1] flex items-end gap-[clamp(10px,5%,26px)]">
                          <span className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[0.5rem] font-semibold tracking-[0.16em] uppercase text-stone-500">
                              Cardholder
                            </span>
                            <span className="font-mono text-[clamp(.6rem,1.6vw,.74rem)] font-medium tracking-wider uppercase text-stone-800 truncate">
                              {nameFace(name)}
                            </span>
                          </span>
                          <span className="flex flex-col gap-0.5 shrink-0">
                            <span className="text-[0.5rem] font-semibold tracking-[0.16em] uppercase text-stone-500">
                              Expires
                            </span>
                            <span className="font-mono text-[clamp(.6rem,1.6vw,.74rem)] font-medium tracking-wider uppercase text-stone-800">
                              ••/••
                            </span>
                          </span>
                          <SchemeMark
                            scheme={schemeKey}
                            className="ml-auto drop-shadow-sm"
                          />
                        </div>
                      </div>

                      {/* BACK */}
                      <div
                        className="absolute inset-0 rounded-[20px] overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] pt-[11%] shadow-[0_1px_0_rgba(255,255,255,.95)_inset,0_0_0_1px_rgba(0,0,0,.06)_inset,0_20px_40px_-18px_rgba(0,0,0,.18)]"
                        style={{
                          background:
                            "linear-gradient(200deg, #fdfaf5, #f5f2ed 46%, #ebe6df)",
                        }}
                      >
                        <span className="absolute inset-0 pointer-events-none bg-[radial-gradient(64%_80%_at_98%_2%,rgba(59,130,246,.15),transparent_66%)]" />
                        <span className="block h-[15.5%] bg-gradient-to-b from-stone-600 via-stone-800 to-stone-900" />
                        <div className="flex items-center mx-[6%] mt-[9%]">
                          <span
                            className="flex-1 h-[26px] rounded-l-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]"
                            style={{
                              background:
                                "repeating-linear-gradient(-46deg, rgba(59,130,246,.2) 0 1px, transparent 1px 5px), linear-gradient(180deg, #fff, #f5f2ed)",
                            }}
                          />
                          <span className="shrink-0 min-w-[58px] h-[26px] px-2.5 grid place-items-center rounded-r-[3px] bg-white text-stone-800 font-mono font-semibold text-[0.78rem] tracking-widest shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]">
                            {schemeKey === "amex" ? "••••" : "•••"}
                          </span>
                        </div>
                        <p className="mt-[7%] mx-[6%] mr-[22%] text-[0.42rem] leading-relaxed text-stone-500">
                          This card is a secure token held by Stripe on behalf
                          of DocuMind. Your real card details never touch our
                          servers.
                        </p>
                        <SchemeMark
                          scheme={schemeKey}
                          className="absolute right-[6%] bottom-[7%] scale-80 origin-bottom-right text-stone-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* order summary */}
              <div
                className={`relative z-[2] w-[min(340px,92%)] p-3.5 transition-all duration-500 ${
                  isActive
                    ? "opacity-0 translate-y-2.5 pointer-events-none"
                    : "opacity-100"
                }`}
                style={{
                  ...theme.panel,
                  borderRadius: "16px",
                  background:
                    "linear-gradient(145deg, rgba(253,250,245,.85), rgba(240,235,227,.75))",
                }}
              >
                <ul className="m-0 p-0 list-none flex flex-col gap-2">
                  <li className="flex items-baseline justify-between gap-3">
                    <span className="text-base font-semibold text-stone-800">
                      Premium Plan
                    </span>
                    <span className="text-[0.95rem] font-semibold tabular-nums text-stone-800">
                      ₹599.00
                    </span>
                  </li>
                </ul>
                <p className="mt-3 mb-0 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-emerald-700">
                  Includes
                </p>
                <ul className="mt-1.5 mb-0 p-0 list-none flex flex-col gap-1.5">
                  {[
                    "Up to 30 documents",
                    "Priority AI processing",
                    "Unlimited chat messages",
                  ].map((f) => (
                    <li
                      key={f}
                      className="relative pl-[18px] text-[0.74rem] font-medium text-stone-500 before:content-['✓'] before:absolute before:left-0 before:top-[-1px] before:text-emerald-600 before:font-extrabold before:text-[0.8rem]"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <p
                  className="mt-3 pt-2.5 flex items-baseline justify-between gap-3 text-[0.76rem] font-semibold text-stone-500"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <span>Total due today</span>
                  <b className="text-[1.15rem] font-extrabold tracking-tight text-stone-800 tabular-nums">
                    ₹599
                    <span className="text-[0.76rem] font-bold text-stone-500">
                      .00
                    </span>
                  </b>
                </p>
              </div>

              {/* verdict */}
              <div
                ref={resultRef}
                className={`absolute left-0 right-0 top-1/2 z-[5] flex flex-col items-center gap-2 px-4 pt-11 text-center pointer-events-none transition-opacity duration-300 ${
                  isActive ? "opacity-100 pointer-events-auto" : "opacity-0"
                }`}
                style={{
                  transform:
                    "translate(var(--result-x,0px), var(--verdict-y,150px))",
                }}
                inert={phase === "idle" ? "" : undefined}
              >
                <span
                  className={`absolute top-1.5 left-0 right-0 mx-auto w-[26px] h-[26px] rounded-full border-2 border-stone-300/50 border-t-blue-500 ${
                    phase === "authorising"
                      ? "opacity-100 animate-[sable-spin_.82s_linear_infinite]"
                      : "opacity-0"
                  }`}
                />
                <svg
                  className={`absolute top-0.5 left-0 right-0 mx-auto w-[34px] h-[34px] fill-none stroke-emerald-600 stroke-[2.4] ${
                    phase === "approved" ? "opacity-100" : "opacity-0"
                  }`}
                  viewBox="0 0 44 44"
                  focusable="false"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    pathLength="1"
                    className="stroke-[2] opacity-30 [animation:sable-draw_.5s_ease_both]"
                  />
                  <path
                    d="M13.5 22.6 19.4 28.5 30.5 16.4"
                    pathLength="1"
                    className="[animation:sable-draw_.42s_ease_.22s_both]"
                  />
                </svg>
                <svg
                  className={`absolute top-0.5 left-0 right-0 mx-auto w-[34px] h-[34px] fill-none stroke-red-600 stroke-[2.4] ${
                    phase === "declined" ? "opacity-100" : "opacity-0"
                  }`}
                  viewBox="0 0 44 44"
                  focusable="false"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    pathLength="1"
                    className="stroke-[2] opacity-30 [animation:sable-draw_.5s_ease_both]"
                  />
                  <path
                    d="M15.5 15.5 28.5 28.5M28.5 15.5 15.5 28.5"
                    pathLength="1"
                    className="[animation:sable-draw_.34s_ease_.2s_both]"
                  />
                </svg>
                <p className="m-0 text-[1.02rem] font-bold tracking-tight text-stone-800">
                  {verdict.say}
                </p>
                <p className="m-0 text-[0.78rem] text-stone-500 max-w-[34ch]">
                  {verdict.sub}
                </p>
                {(phase === "approved" || phase === "declined") && (
                  <button
                    ref={againBtnRef}
                    type="button"
                    onClick={phase === "approved" ? finishSuccess : resetToIdle}
                    className="mt-1 font-semibold text-[0.76rem] text-stone-800 rounded-full px-4 py-2 transition hover:border-blue-400 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                    style={{
                      ...theme.button,
                      borderRadius: "999px",
                    }}
                  >
                    {phase === "approved" ? "Continue" : "Try again"}
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: form ── */}
            <div
              className={`relative z-[2] flex flex-col p-5 md:p-8 transition-all duration-500 ${
                isActive
                  ? "opacity-0 translate-x-5 pointer-events-none max-md:hidden"
                  : "opacity-100"
              }`}
              inert={phase !== "idle" ? "" : undefined}
            >
              <button
                type="button"
                onClick={onBack}
                className="self-start mb-3.5 text-[0.74rem] font-bold tracking-wide text-stone-500 bg-transparent border-0 p-1 cursor-pointer hover:text-stone-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 rounded"
              >
                ← Back
              </button>

              <form
                className="flex flex-col w-full"
                onSubmit={handleSubmit}
                noValidate
              >
                <h2 className="m-0 text-[1.32rem] font-bold tracking-tight text-stone-800">
                  Payment details
                </h2>
                <p className="mt-1.5 mb-5 text-[0.82rem] text-stone-500">
                  Enter your card to upgrade to Premium.
                </p>

                {/* name */}
                <div className="flex flex-col min-w-0">
                  <label
                    className="text-[0.64rem] font-bold tracking-[0.13em] uppercase text-stone-500 mb-1.5"
                    htmlFor="cc-name"
                  >
                    Cardholder name
                  </label>
                  <div
                    className={`group relative flex items-center gap-2.5 h-12 px-3.5 transition ${
                      errors.name
                        ? "border-red-500"
                        : "focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,.18)]"
                    }`}
                    style={{
                      ...theme.input,
                      borderRadius: "14px",
                      borderColor: errors.name ? "#ef4444" : undefined,
                    }}
                  >
                    <FieldIcon>
                      <circle cx="10" cy="6.6" r="3.1" />
                      <path d="M3.8 16.6c.6-3.2 3.1-4.8 6.2-4.8s5.6 1.6 6.2 4.8" />
                    </FieldIcon>
                    <input
                      id="cc-name"
                      name="name"
                      type="text"
                      autoComplete="cc-name"
                      spellCheck="false"
                      placeholder="Name on card"
                      maxLength={26}
                      value={name}
                      ref={nameInputRef}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name)
                          setErrors((er) => ({ ...er, name: "" }));
                      }}
                      className="flex-1 min-w-0 border-0 outline-none bg-transparent font-['Plus_Jakarta_Sans'] text-[0.92rem] font-medium text-stone-800 placeholder:text-stone-400 placeholder:font-normal"
                    />
                  </div>
                  <p
                    className={`flex items-center gap-1.5 m-0 min-h-8 py-1.5 text-[0.72rem] font-medium text-red-600 transition ${
                      errors.name ? "opacity-100" : "opacity-0 -translate-y-1"
                    }`}
                  >
                    <ErrIcon />
                    <span>{errors.name}</span>
                  </p>
                </div>

                {/* number */}
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.64rem] font-bold tracking-[0.13em] uppercase text-stone-500 mb-1.5">
                    Card number
                  </label>
                  <div
                    className={`group relative flex items-center gap-2.5 h-12 px-3.5 transition ${
                      errors.number
                        ? "border-red-500"
                        : "focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,.18)]"
                    }`}
                    style={{
                      ...theme.input,
                      borderRadius: "14px",
                      borderColor: errors.number ? "#ef4444" : undefined,
                    }}
                  >
                    <FieldIcon>
                      <rect
                        x="2.2"
                        y="4.4"
                        width="15.6"
                        height="11.2"
                        rx="2.2"
                      />
                      <path d="M2.2 8.4h15.6" />
                    </FieldIcon>
                    <div className="flex-1 min-w-0" ref={numberMountRef} />
                    <SchemeMark
                      scheme={schemeKey}
                      className="text-stone-700 w-[42px] h-4"
                    />
                  </div>
                  <p
                    className={`flex items-center gap-1.5 m-0 min-h-8 py-1.5 text-[0.72rem] font-medium text-red-600 transition ${
                      errors.number ? "opacity-100" : "opacity-0 -translate-y-1"
                    }`}
                  >
                    <ErrIcon />
                    <span>{errors.number}</span>
                  </p>
                </div>

                {/* expiry + cvc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col min-w-0">
                    <label className="text-[0.64rem] font-bold tracking-[0.13em] uppercase text-stone-500 mb-1.5">
                      Expiry date
                    </label>
                    <div
                      className={`group relative flex items-center gap-2.5 h-12 px-3.5 transition ${
                        errors.expiry
                          ? "border-red-500"
                          : "focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,.18)]"
                      }`}
                      style={{
                        ...theme.input,
                        borderRadius: "14px",
                        borderColor: errors.expiry ? "#ef4444" : undefined,
                      }}
                    >
                      <FieldIcon>
                        <rect x="3" y="4.4" width="14" height="12.2" rx="2.2" />
                        <path d="M3 8.2h14M6.8 2.6v3.2M13.2 2.6v3.2" />
                      </FieldIcon>
                      <div className="flex-1 min-w-0" ref={expiryMountRef} />
                    </div>
                    <p
                      className={`flex items-center gap-1.5 m-0 min-h-8 py-1.5 text-[0.72rem] font-medium text-red-600 transition ${
                        errors.expiry
                          ? "opacity-100"
                          : "opacity-0 -translate-y-1"
                      }`}
                    >
                      <ErrIcon />
                      <span>{errors.expiry}</span>
                    </p>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <label className="text-[0.64rem] font-bold tracking-[0.13em] uppercase text-stone-500 mb-1.5">
                      CVC
                    </label>
                    <div
                      className={`group relative flex items-center gap-2.5 h-12 px-3.5 transition ${
                        errors.cvc
                          ? "border-red-500"
                          : "focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,.18)]"
                      }`}
                      style={{
                        ...theme.input,
                        borderRadius: "14px",
                        borderColor: errors.cvc ? "#ef4444" : undefined,
                      }}
                    >
                      <FieldIcon>
                        <rect x="4" y="8.6" width="12" height="8" rx="2" />
                        <path d="M7.2 8.6V6.4a2.8 2.8 0 0 1 5.6 0v2.2" />
                      </FieldIcon>
                      <div className="flex-1 min-w-0" ref={cvcMountRef} />
                    </div>
                    <p
                      className={`flex items-center gap-1.5 m-0 min-h-8 py-1.5 text-[0.72rem] font-medium text-red-600 transition ${
                        errors.cvc ? "opacity-100" : "opacity-0 -translate-y-1"
                      }`}
                    >
                      <ErrIcon />
                      <span>{errors.cvc}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={payDisabled}
                  className="relative mt-2.5 overflow-hidden flex items-center justify-center gap-2 h-[52px] w-full border-0 cursor-pointer font-bold text-[0.95rem] text-white transition hover:enabled:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                  style={{
                    ...theme.primary,
                    borderRadius: "14px",
                    boxShadow: payDisabled
                      ? "0 4px 14px rgba(59,130,246,0.15)"
                      : "0 8px 28px rgba(59,130,246,0.32), inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  <svg
                    className="w-[15px] h-[15px] fill-none stroke-current stroke-[1.5] opacity-85"
                    viewBox="0 0 16 16"
                    aria-hidden
                    focusable="false"
                  >
                    <rect x="3.2" y="7" width="9.6" height="7" rx="1.9" />
                    <path d="M5.7 7V5.2a2.3 2.3 0 0 1 4.6 0V7" />
                  </svg>
                  <span>{processing ? "Authorising…" : "Pay ₹599.00"}</span>
                  <svg
                    className="w-[17px] h-[17px] fill-none stroke-current stroke-[1.7]"
                    viewBox="0 0 20 20"
                    aria-hidden
                    focusable="false"
                  >
                    <path d="M3.6 10h12.8M11.2 5.2 16.4 10l-5.2 4.8" />
                  </svg>
                </button>

                {loadError ? (
                  <p className="mt-3 text-center text-[0.68rem] font-semibold text-amber-700">
                    {loadError}
                  </p>
                ) : !ready ? (
                  <p className="mt-3 text-center text-[0.68rem] font-medium text-stone-400">
                    Loading secure payment fields…
                  </p>
                ) : (
                  <p className="mt-3 text-center text-[0.68rem] font-medium text-stone-400">
                    Powered by Stripe · Card details are encrypted and never
                    touch our servers
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpgradePage;
