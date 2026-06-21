import { useEffect, useState } from "react";
import { site } from "../../content/site";
import { useInView } from "../../lib/hooks";

export default function Terminal() {
  const { terminal: t } = site;
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [bootCount, setBootCount] = useState(0);
  const [cmdCount, setCmdCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    t.boot.forEach((_, i) => timers.push(setTimeout(() => setBootCount(i + 1), 350 + i * 450)));
    const afterBoot = 350 + t.boot.length * 450;
    t.commands.forEach((_, i) => timers.push(setTimeout(() => setCmdCount(i + 1), afterBoot + i * 900)));
    return () => timers.forEach(clearTimeout);
  }, [inView, t.boot, t.commands]);

  return (
    <div
      ref={ref}
      className="glass-dark flex h-full flex-col overflow-hidden rounded-2xl font-mono text-[12.5px] leading-relaxed"
    >
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-[var(--dark-line)] px-4 py-3">
        <span className="inline-flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </span>
          <span className="ml-2 tracking-[0.04em] text-dark-ink/80">{t.label}</span>
        </span>
        <span className="text-dark-ink-mute">{t.meta}</span>
      </div>

      {/* body */}
      <div className="flex-1 space-y-1 p-4 text-[#7CFFB2]">
        {t.boot.slice(0, bootCount).map((line, i) => (
          <div key={i} className="animate-msgIn text-dark-ink/85">
            {i === 0 ? <span className="text-[#7CFFB2]">{line}</span> : line}
          </div>
        ))}
        {bootCount >= t.boot.length && (
          <div className="space-y-1 pt-2">
            {t.commands.slice(0, cmdCount).map((c, i) => (
              <div key={i} className="animate-msgIn">
                <div>
                  <span className="text-[#7CFFB2]">jalen@workstation</span>
                  <span className="text-dark-ink-mute"> ~ $ </span>
                  <span className="text-dark-ink">{c.cmd}</span>
                </div>
                <div className="text-dark-ink-dim">{c.out}</div>
              </div>
            ))}
            {cmdCount >= t.commands.length && (
              <div className="pt-1">
                <span className="text-[#7CFFB2]">jalen@workstation</span>
                <span className="text-dark-ink-mute"> ~ $ </span>
                <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-pulseDot bg-[#7CFFB2]" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
