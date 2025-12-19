import React, { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';

const UserCounter = () => {
    const [displayCount, setDisplayCount] = useState(1586);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check for mobile
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 100);

        // Calculate current count based on days since Dec 8, 2025
        const baseCount = 1586;
        const baseDate = new Date('2025-12-08');
        const dailyIncrease = 20;

        const now = new Date();
        const daysSinceBase = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
        const actualCount = baseCount + (daysSinceBase * dailyIncrease);

        // Animate count up with easing
        let step = 0;
        const steps = 60;
        const duration = 2000;

        const timer = setInterval(() => {
            step++;
            const progress = 1 - Math.pow(1 - step / steps, 3);
            const current = Math.floor(actualCount * progress);

            if (step >= steps) {
                setDisplayCount(actualCount);
                clearInterval(timer);
            } else {
                setDisplayCount(current);
            }
        }, duration / steps);

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Mobile version - smaller and positioned differently
    if (isMobile) {
        return (
            <>
                <div style={{
                    position: 'fixed',
                    top: '12px',
                    right: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '8px 14px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
                    borderRadius: '16px',
                    border: '1.5px solid rgba(139, 92, 246, 0.3)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 1000,
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    <Users size={16} style={{ color: '#8b5cf6' }} />
                    <span style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {formatNumber(displayCount)}
                    </span>
                    <TrendingUp size={12} style={{ color: '#10b981' }} />
                </div>
            </>
        );
    }

    // Desktop version
    return (
        <>
            <div style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                padding: '16px 28px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.12))',
                borderRadius: '24px',
                border: '2px solid rgba(139, 92, 246, 0.25)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                zIndex: 1000,
                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: 'gentlePulse 3s ease-in-out infinite',
                overflow: 'hidden'
            }}>
                {/* Animated background gradient */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(120deg, transparent, rgba(139, 92, 246, 0.1), transparent)',
                    animation: 'shimmer 3s ease-in-out infinite',
                    pointerEvents: 'none'
                }}></div>

                {/* Icon with rotation animation */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'iconFloat 2s ease-in-out infinite'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)',
                        animation: 'ripple 2s ease-out infinite'
                    }}></div>
                    <Users size={26} style={{
                        color: '#8b5cf6',
                        filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.7))',
                        position: 'relative',
                        zIndex: 1
                    }} />
                </div>

                {/* Counter display */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '6px'
                    }}>
                        <span style={{
                            fontSize: '1.6rem',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                            animation: 'gradientShift 4s ease infinite',
                            textShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
                        }}>
                            {formatNumber(displayCount)}
                        </span>
                        <TrendingUp size={16} style={{
                            color: '#10b981',
                            filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))',
                            animation: 'trending 1.5s ease-in-out infinite'
                        }} />
                    </div>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span>Usando el Panel</span>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#10b981',
                            animation: 'liveBlink 2s ease-in-out infinite',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                        }}></div>
                    </div>
                </div>

                {/* Plus badge */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '12px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    animation: 'badgePop 2s ease-in-out infinite'
                }}>
                    +600/mes
                </div>
            </div>
            <style>{`
                @keyframes shimmer {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
                @keyframes gentlePulse {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    }
                    50% { 
                        transform: scale(1.01);
                        box-shadow: 0 20px 60px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                    }
                }
                @keyframes iconFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-3px) rotate(-5deg); }
                    75% { transform: translateY(3px) rotate(5deg); }
                }
                @keyframes ripple {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes trending {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes liveBlink {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.2); }
                }
                @keyframes badgePop {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </>
    );
};

export default UserCounter;
