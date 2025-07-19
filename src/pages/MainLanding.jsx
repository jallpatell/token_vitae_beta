// pages/index.js
"use client"
import Head from "next/head";
import PriceQueryForm from "../components/PriceQueryForm";
import TokenHistory from "../components/TokenHistory";
import LiquidGlassCard from "../components/LiquidGlassCard";
import SideNav from "../components/SideNav";

const stats = [
  { label: 'Accuracy', value: '99.87%' },
  { label: 'Tokens Supported', value: '5k+' },
  { label: 'APIs', value: '2' },
  { label: 'Chains', value: 'Ethereum, Polygon' },
];

const features = [
  {
    title: 'Real-Time Oracle',
    desc: 'Instant price queries for any supported token, anytime.',
    icon: '⚡',
  },
  {
    title: 'Historical Data',
    desc: 'Fetch accurate historical prices for compliance and analytics.',
    icon: '📈',
  },
  {
    title: 'DeFi-Ready',
    desc: 'Chainlink + Alchemy integration for on-chain and off-chain needs.',
    icon: '🔗',
  },
  {
    title: 'Premium Caching',
    desc: 'Redis-backed cache for blazing fast repeat queries.',
    icon: '🧊',
  },
  {
    title: 'Developer Friendly',
    desc: 'Swagger docs, easy API, and open-source SDKs.',
    icon: '💻',
  },
  {
    title: 'Secure & Audited',
    desc: 'OWASP best practices, rate limiting, and audit trails.',
    icon: '🔒',
  },
];

export default function MainLandingPage() {
  return (
    <>
      <Head>
        <title className="text-black">Token Oracle | The Ultimate Crypto Price API</title>
        <meta name="description" content="Token Oracle: The most accurate, real-time & historical crypto price API for DeFi, analytics, and traders. Premium caching, Chainlink + Alchemy, and beautiful UI." />
      </Head>
      <SideNav />
      {/* Animated background grid and floating elements */}
      <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
        {/* Animated grid */}
        <div className="absolute inset-0 z-0 pointer-events-none animate-bgGrid" style={{backgroundImage:'linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
        {/* Floating blobs */}
        <div className="absolute top-10 left-10 w-60 h-60 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-30 blur-3xl animate-float-slow"/>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full opacity-20 blur-2xl animate-float"/>
        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] pt-24 pb-12 text-center">
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-10 shadow-2xl border border-white/10 max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow mb-4">Token Oracle</h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-6">The most accurate, real-time & historical price oracle for any token.<br/>Built for DeFi, analytics, and traders.</p>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {stats.map(stat => (
                <div key={stat.label} className="flex flex-col items-center px-4">
                  <span className="text-3xl font-bold text-white drop-shadow-lg">{stat.value}</span>
                  <span className="text-gray-300 text-sm uppercase tracking-wider mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Features Grid */}
        <section className="relative z-10 max-w-6xl mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 animate-fade-in-up">
          {features.map(f => (
            <div key={f.title} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-200 text-center">{f.desc}</p>
            </div>
          ))}
        </section>
        {/* Interactive Demo */}
        <section id="demo" className="relative z-10 flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-stretch">
            <LiquidGlassCard className="p-0 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 shadow-xl">
              <PriceQueryForm />
            </LiquidGlassCard>
            <LiquidGlassCard className="p-0 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 shadow-xl">
              <TokenHistory />
            </LiquidGlassCard>
          </div>
        </section>
        {/* Footer */}
        <footer className="relative z-10 py-8 text-center text-gray-400 bg-black/30 backdrop-blur-lg border-t border-white/10">
          <div className="mb-2">&copy; {new Date().getFullYear()} Token Oracle. All rights reserved.</div>
          <div className="flex justify-center gap-6 text-lg">
            <a href="mailto:contact@tokenoracle.com" className="hover:text-white transition">Contact</a>
            <a href="https://x.com/jallpatell" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</a>
            <a href="https://github.com/jallpatel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
          </div>
        </footer>
        {/* Animations */}
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
            100% { transform: translateY(0px); }
          }
          @keyframes float-slow {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-60px); }
            100% { transform: translateY(0px); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 1.2s ease; }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(.4,0,.2,1); }
          @keyframes bgGrid {
            0% { background-position: 0 0, 0 0; }
            100% { background-position: 40px 40px, 40px 40px; }
          }
          .animate-bgGrid { animation: bgGrid 20s linear infinite; }
        `}</style>
      </div>
    </>
  );
}
