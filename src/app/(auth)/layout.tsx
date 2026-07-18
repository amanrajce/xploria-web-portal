import { Compass } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090a0d] relative overflow-hidden flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative Premium Glow Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-xploria-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] z-10 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-xploria-primary/10 flex items-center justify-center mb-4 border border-xploria-primary/20 shadow-lg shadow-xploria-primary/5 backdrop-blur-sm transition-all duration-300 hover:rotate-12">
            <Compass className="w-7 h-7 text-xploria-primary" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white leading-none">
            Xploria
          </span>
          <span className="text-[11px] text-xploria-muted font-bold uppercase tracking-widest mt-2">
            Premium Trip Planner
          </span>
        </div>

        <div className="bg-[#16171b]/80 border border-[#24262c] rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          {children}
        </div>
      </div>
    </div>
  );
}
