const LOGO_URL = '/WFD_logo_transparent.png';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, #4a0000, #A40104 30%, #A40104 70%, #4a0000)',
      }}
    >

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-12 lg:px-12 lg:py-8 gap-8 lg:gap-16">
        <div className="flex flex-col items-center text-center max-w-md">
          <p className="text-wfd-gold/80 text-xs lg:text-sm tracking-[0.2em] uppercase font-semibold mb-4 font-serif">
            Winchester Fire Department
          </p>
          <img
            src={LOGO_URL}
            alt="Winchester Fire Department"
            className="rounded mb-6"
            style={{
              width: 'clamp(170px, 30vw, 380px)',
              height: 'auto',
              display: 'block',
              marginInline: 'auto',
            }}
          />
          <h1 className="text-3xl lg:text-5xl font-bold text-white font-serif mb-3">
            EMS Student Portal
          </h1>
          <p className="text-white/70 text-sm lg:text-base mb-2">
            Winchester Fire Department
          </p>
          <p className="text-wfd-gold/60 text-xs lg:text-sm italic font-serif">
            Training the next generation of EMS professionals.
          </p>
        </div>

        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/10 p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-wfd-charcoal/60 text-white/50 text-xs text-center py-3">
        &copy; Winchester Fire Department &middot; Division of EMS
      </div>
    </div>
  );
}
