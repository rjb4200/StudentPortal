const LOGO_URL = '/WFD_logo_transparent.png';

export default function InstructorRegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, #4a0000, #A40104 30%, #A40104 70%, #4a0000)',
      }}
    >
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-12 lg:px-12 lg:gap-12">
        <div className="flex flex-col items-center text-center max-w-[14rem] mb-4 lg:mb-0">
          <p className="text-wfd-gold/80 text-xs lg:text-xs tracking-[0.2em] uppercase font-semibold mb-3 font-serif">
            Winchester Fire Department
          </p>
          <img
            src={LOGO_URL}
            alt="Winchester Fire Department"
            className="rounded mb-4"
            style={{
              width: 'clamp(100px, 18vw, 200px)',
              height: 'auto',
              display: 'block',
              marginInline: 'auto',
            }}
          />
          <h1 className="text-2xl lg:text-2xl font-bold text-white font-serif mb-2">
            EMS Student Portal
          </h1>
          <p className="text-white/70 text-xs lg:text-sm mb-1">
            Winchester Fire Department
          </p>
          <p className="text-wfd-gold/60 text-xs italic font-serif">
            Training the next generation of EMS professionals.
          </p>
        </div>

        <div className="w-full max-w-md lg:flex-1 lg:max-w-5xl">
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
