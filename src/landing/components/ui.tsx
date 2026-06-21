import React from "react";
import { Link } from "react-router-dom";
import { useInView } from "../lib/hooks";

/** True for in-app routes ("/workstation", "/work") but not files ("/resume.pdf") or anchors. */
function isInternalRoute(href?: string): href is string {
  return Boolean(href) && href!.startsWith("/") && !/\.[a-z0-9]+$/i.test(href!);
}

/* ---------- Icons ---------- */
export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function PlusMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5c.7 0 1.1.6 1.2 1.7l.3 4.1 4.1.3c1.1.1 1.7.5 1.7 1.2s-.6 1.1-1.7 1.2l-4.1.3-.3 4.1c-.1 1.1-.5 1.7-1.2 1.7s-1.1-.6-1.2-1.7l-.3-4.1-4.1-.3C5.1 13.1 4.5 12.7 4.5 12s.6-1.1 1.7-1.2l4.1-.3.3-4.1C10.9 4.1 11.3 3.5 12 3.5Z"
        fill="currentColor" />
    </svg>
  );
}

/* ---------- Eyebrows ---------- */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}
export function EyebrowPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`eyebrow-pill ${className}`}>{children}</span>;
}

/* ---------- Tag chip ---------- */
export function TagChip({ children }: { children: React.ReactNode }) {
  return <span className="tag-chip">{children}</span>;
}

/* ---------- Primary button (white pill + dark arrow chip) ---------- */
export function BtnPrimary({
  href, children, match = false, onClick, className = "", target,
}: {
  href?: string; children: React.ReactNode; match?: boolean;
  onClick?: () => void; className?: string; target?: string;
}) {
  const cls = `btn-primary ${match ? "btn-primary-match" : ""} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span className="chip"><ArrowRight /></span>
    </>
  );
  if (isInternalRoute(href)) {
    return <Link to={href} className={cls}>{inner}</Link>;
  }
  if (href) {
    return (
      <a href={href} className={cls} target={target} rel={target === "_blank" ? "noreferrer" : undefined}>
        {inner}
      </a>
    );
  }
  return <button className={cls} onClick={onClick}>{inner}</button>;
}

/* ---------- Reveal-on-scroll wrapper ---------- */
export function Reveal({
  children, className = "", delay = 0,
}: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
