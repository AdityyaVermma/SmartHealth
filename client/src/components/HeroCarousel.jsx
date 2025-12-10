import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hero1 from '../assets/hero.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';

const images = [
    { src: hero1, title: "Smart Community Health", subtitle: "Advanced AI-powered monitoring and early warning system for water-borne diseases." },
    { src: hero2, title: "Real-time Analytics", subtitle: "Track health trends and outbreaks as they happen with precision data." },
    { src: hero3, title: "Community First", subtitle: "Empowering local health workers with the tools they need to save lives." }
];

const HeroCarousel = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ position: 'relative', height: '500px', borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '3rem', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url(${images[index].src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '2rem'
                    }}
                >
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="page-title"
                        style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #38bdf8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        {images[index].title}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="page-subtitle"
                        style={{ maxWidth: '700px', fontSize: '1.25rem', lineHeight: '1.75', color: '#e2e8f0' }}
                    >
                        {images[index].subtitle}
                    </motion.p>
                </motion.div>
            </AnimatePresence>

            <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                {images.map((_, i) => (
                    <div
                        key={i}
                        onClick={() => setIndex(i)}
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: i === index ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
