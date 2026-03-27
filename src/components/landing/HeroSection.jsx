import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Search, MapPin } from 'lucide-react';
import HeroSearchBar from './HeroSearchBar';

// --- IMPORTS ---
import heroVideo1 from '../../assets/hero/video1.mp4';
import heroVideo2 from '../../assets/hero/video2.mp4';
import heroVideo3 from '../../assets/hero/video3.mp4';
import heroVideo4 from '../../assets/hero/video4.mp4';
import heroVideo5 from '../../assets/hero/video5.mp4';
import heroVideo6 from '../../assets/hero/video6.mp4';
import heroVideo7 from '../../assets/hero/video7.mp4';

const HeroSection = () => {
    const navigate = useNavigate();

    const [activePlayer, setActivePlayer] = useState(0);
    const [playOrder, setPlayOrder] = useState(0);

    const player1Ref = useRef(null);
    const player2Ref = useRef(null);

    const playlist = [
        heroVideo3, heroVideo4, heroVideo2, heroVideo1, heroVideo5, heroVideo6, heroVideo7
    ];

    const getSrcForPlayer = (playerId) => {
        const currentPlaylistIndex = playOrder % playlist.length;
        const nextPlaylistIndex = (playOrder + 1) % playlist.length;
        return playerId === activePlayer ? playlist[currentPlaylistIndex] : playlist[nextPlaylistIndex];
    };

    const handleVideoEnded = () => {
        const nextPlayer = activePlayer === 0 ? 1 : 0;
        const nextRef = nextPlayer === 0 ? player1Ref : player2Ref;
        const currentRef = activePlayer === 0 ? player1Ref : player2Ref;

        if (nextRef.current) {
            nextRef.current.currentTime = 0;
            nextRef.current.play().then(() => {
                setActivePlayer(nextPlayer);
                setPlayOrder(prev => prev + 1);
                if (currentRef.current) currentRef.current.pause();
            }).catch(() => { });
        }
    };

    return (
        <div className="relative w-full h-[100svh] min-h-[600px] bg-[#1A1A1A] flex flex-col">

            {/* --- FULL BACKGROUND VIDEO --- */}
            <div className="absolute inset-0 w-full h-full z-0 bg-black">
                <div className={`absolute inset-0 ${activePlayer === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <video ref={player1Ref} src={getSrcForPlayer(0)} autoPlay={true} muted playsInline preload="auto" onEnded={handleVideoEnded} className="w-full h-full object-cover" />
                </div>
                <div className={`absolute inset-0 ${activePlayer === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <video ref={player2Ref} src={getSrcForPlayer(1)} muted playsInline preload="auto" onEnded={handleVideoEnded} className="w-full h-full object-cover" />
                </div>
                {/* Gradient overlay — stronger at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 z-20 pointer-events-none" />
            </div>

            {/* --- CONTENT — centered on all screens --- */}
            <div className="relative z-30 flex-1 flex flex-col justify-center px-6 md:px-4 pb-16 md:pb-0">
                <div className="max-w-5xl mx-auto w-full text-center flex flex-col items-center gap-8 md:gap-8">

                    {/* HEADLINE */}
                    <div>
                        <h1 className="text-white leading-[1.1] drop-shadow-2xl">
                            <span className="block font-serif text-[2.7rem] sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter whitespace-nowrap">
                                Arrival to <span className="italic text-[#F7E6B0]">Belonging.</span>
                            </span>
                        </h1>
                        <p className="font-sans text-base sm:text-lg md:text-xl text-white/80 mt-5 md:mt-6 max-w-md sm:max-w-lg md:max-w-2xl mx-auto font-medium leading-relaxed">
                            Thoughtfully designed living spaces made for new beginnings. No paperwork stress. No uncertainty. Just home.
                        </p>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="w-full max-w-md md:max-w-lg mt-6 md:mt-0">
                        <HeroSearchBar />
                    </div>

                    {/* EXPLORE LINKS */}
                    <div className="flex items-center gap-4 text-sm font-medium drop-shadow-md -mt-3 md:-mt-6">
                        <Link to="/cities" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                            <MapPin size={14} />
                            Explore cities
                        </Link>
                        <span className="text-white/30">|</span>
                        <Link to="/search" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                            <Search size={14} />
                            Browse all
                        </Link>
                    </div>
                </div>
            </div>

            {/* LIVE BADGE — bottom, desktop only */}
            <div className="absolute bottom-6 md:bottom-8 left-0 w-full z-40 flex justify-center">
                <div className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0f0f0]">Now Live in Germany</span>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
