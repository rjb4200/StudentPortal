'use client';

export function PrintPacketButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg text-sm font-semibold bg-wfd-charcoal text-white hover:brightness-125 transition-all print:hidden"
    >
      Print Full Packet
    </button>
  );
}
