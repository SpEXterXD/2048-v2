"use client";

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      <div
        className="animate-ambient-1 absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full filter blur-3xl transition-colors duration-500"
        style={{ background: "var(--orb-1)" }}
      />
      <div
        className="animate-ambient-2 absolute -bottom-24 -right-24 h-[36rem] w-[36rem] rounded-full filter blur-3xl transition-colors duration-500"
        style={{ background: "var(--orb-2)" }}
      />
      <div
        className="animate-ambient-pulse absolute top-1/2 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full filter blur-[90px] transition-colors duration-500"
        style={{ background: "var(--orb-3)" }}
      />
    </div>
  );
}
