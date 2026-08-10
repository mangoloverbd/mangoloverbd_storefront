import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const REEL_VIDEOS = [
    {
        id: 1,
        url: "/vid_01.mp4",
        title: "Touch Up Anywhere",
        price: "4-in-1",
        category: "Makeup Pen Ritual"
    },
    {
        id: 2,
        url: "/vid_02.mp4",
        title: "Ready In Seconds",
        price: "4-in-1",
        category: "No Makeup Look"
    },
    {
        id: 3,
        url: "/vid_03.mp4",
        title: "Compact Definition",
        price: "4-in-1",
        category: "Everyday Beauty"
    }
];

export default function VideoReel() {
    return (
        <section className="bg-brand-ivory pt-0 pb-0 md:pt-0 md:pb-0 flex flex-col overflow-hidden">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-16 mb-16 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 md:gap-10 border-y border-black/10 py-8 md:py-10"
                >
                    <div className="flex flex-col items-start gap-3">
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.35em] md:tracking-[0.6em] font-bold text-brand-gold">
                            Editorial
                        </span>
                        <span className="h-px w-10 md:w-20 bg-black/15" />
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-medium text-black/35">
                            SS26
                        </span>
                    </div>

                    <h2 className="text-center text-4xl md:text-7xl font-display font-light uppercase tracking-tight text-black leading-none">
                        <span className="font-bold">Cinema</span> Noir
                    </h2>

                    <div className="flex flex-col items-end gap-3 text-right">
                        <span className="text-[8px] md:text-[10px] normal-case tracking-[0.35em] md:tracking-[0.6em] font-bold text-brand-gold">
                            Stepprs
                        </span>
                        <span className="h-px w-10 md:w-20 bg-black/15" />
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-medium text-black/35">
                            03 Films
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Swiss Editorial Films */}
            <div className="no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-0 md:mx-auto md:grid md:max-w-[1180px] md:grid-cols-3 md:items-start md:gap-8 md:overflow-visible md:px-16 md:pb-0">
                {REEL_VIDEOS.map((video, idx) => (
                    <motion.div
                        key={video.id}
                        initial={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-[9/16] w-[78vw] max-w-[340px] shrink-0 snap-center sm:w-[46vw] md:w-full md:max-w-none"
                    >
                        <div className="mb-3 flex items-center justify-between border-t border-black/10 pt-2">
                            <span className="text-[7px] md:text-[9px] uppercase tracking-[0.25em] md:tracking-[0.45em] font-bold text-brand-gold">
                                0{idx + 1}
                            </span>
                            <span className="hidden md:block h-px flex-1 mx-4 bg-black/10" />
                            <span className="hidden md:inline text-[7px] md:text-[9px] uppercase tracking-[0.18em] md:tracking-[0.35em] font-medium text-black/35">
                                Film
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 top-6 bg-neutral-900 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:shadow-[0_40px_90px_rgba(0,0,0,0.14)]">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                onLoadedMetadata={(event) => {
                                    event.currentTarget.play().catch(() => undefined);
                                }}
                                className="w-full h-full object-cover brightness-100 contrast-105 saturate-110 group-hover:scale-105 transition-transform duration-[3s] ease-out"
                            >
                                <source src={video.url} type="video/mp4" />
                            </video>
                        </div>

                        {/* Luxury Overlays */}
                        <div className="absolute inset-x-0 bottom-0 top-6 z-10 p-2 md:p-6 flex flex-col justify-between pointer-events-none">
                            <div className="hidden md:flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <span className="text-[10px] text-white/60 uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1">
                                    Live from Atelier
                                </span>
                            </div>

                            <div className="hidden translate-y-1 md:block md:translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                <motion.div
                                    className="bg-brand-ivory/90 backdrop-blur-xl p-2 md:p-5 shadow-2xl pointer-events-auto border-l border-brand-gold"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1 mb-1 md:mb-2">
                                        <h4 className="font-display text-[11px] md:text-lg uppercase tracking-tight text-black leading-none">{video.title}</h4>
                                        <span className="text-[7px] md:text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em]">{video.price}</span>
                                    </div>
                                    <p className="hidden md:block text-[8px] uppercase tracking-[0.2em] text-black/40 mb-4">
                                        {video.category} / Studio v.01
                                    </p>
                                    <button className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-bold text-black hover:text-brand-gold transition-colors">
                                        <ShoppingBag className="w-3 h-3" /> Shop Piece
                                    </button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Frame Detail */}
                        <div className="absolute inset-x-2 bottom-2 top-8 border border-white/10 pointer-events-none group-hover:inset-x-4 group-hover:bottom-4 group-hover:top-10 transition-all duration-700" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
