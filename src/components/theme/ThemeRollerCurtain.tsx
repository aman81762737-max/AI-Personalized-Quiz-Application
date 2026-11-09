import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeRollerCurtain: React.FC = () => {
  const { isTransitioning, transitionData } = useTheme();

  if (!isTransitioning || !transitionData) return null;

  const isDarkTarget = transitionData.isDark;
  const primaryColor = transitionData.primary || (isDarkTarget ? '#00F0FF' : '#3B82F6');
  const accentColor = transitionData.accent || (isDarkTarget ? '#00FF88' : '#2563EB');
  const bgColor = transitionData.bg || (isDarkTarget ? '#07090E' : '#F8FAFC');

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999999] pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        {/*
          1. Water Ripple Surface Wash Disc:
          Spreads outward from the center where the rock landed, washing the screen with the new theme
        */}
        <motion.div
          initial={{ scale: 0, opacity: 0.98 }}
          animate={{ scale: 1, opacity: [0.98, 1, 0] }}
          transition={{
            scale: { duration: 0.88, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.95, times: [0, 0.8, 1], ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '280vmax',
            height: '280vmax',
            marginLeft: '-140vmax',
            marginTop: '-140vmax',
            borderRadius: '9999px',
            backgroundColor: bgColor,
            boxShadow: `0 0 100px 30px ${primaryColor}50`,
            willChange: 'transform, opacity',
          }}
        />

        {/*
          2. Primary Water Ripple Crest Wave:
          Luminous shockwave ring expanding rapidly across the whole screen
        */}
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: [1, 0.95, 0.6, 0] }}
          transition={{
            scale: { duration: 0.88, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.88, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '280vmax',
            height: '280vmax',
            marginLeft: '-140vmax',
            marginTop: '-140vmax',
            borderRadius: '9999px',
            border: `4px solid ${primaryColor}`,
            boxShadow: `0 0 60px 15px ${primaryColor}, inset 0 0 40px 10px ${primaryColor}`,
            willChange: 'transform, opacity',
          }}
        />

        {/*
          3. Secondary Concentric Trailing Ripple Wave:
          Follows the primary wave with a short fluid stagger
        */}
        <motion.div
          initial={{ scale: 0, opacity: 0.85 }}
          animate={{ scale: 0.92, opacity: [0.85, 0.7, 0.3, 0] }}
          transition={{
            scale: { duration: 0.92, delay: 0.09, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.92, delay: 0.09, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '280vmax',
            height: '280vmax',
            marginLeft: '-140vmax',
            marginTop: '-140vmax',
            borderRadius: '9999px',
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 35px 8px ${accentColor}`,
            willChange: 'transform, opacity',
          }}
        />

        {/*
          4. Tertiary Echo Ripple Wave:
          Fine harmonic outer wave spreading to screen corners
        */}
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 0.82, opacity: [0.6, 0.45, 0.15, 0] }}
          transition={{
            scale: { duration: 0.95, delay: 0.18, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.95, delay: 0.18, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '280vmax',
            height: '280vmax',
            marginLeft: '-140vmax',
            marginTop: '-140vmax',
            borderRadius: '9999px',
            border: `2px dashed ${primaryColor}90`,
            willChange: 'transform, opacity',
          }}
        />

        {/*
          5. Center Impact Droplet Flash:
          The focal splash point where the rock landed in the center
        */}
        <motion.div
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: [0.2, 1.8, 2.8], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '140px',
            height: '140px',
            marginLeft: '-70px',
            marginTop: '-70px',
            borderRadius: '9999px',
            background: `radial-gradient(circle, ${primaryColor} 0%, ${accentColor} 50%, transparent 80%)`,
            filter: 'blur(6px)',
            boxShadow: `0 0 40px 15px ${primaryColor}`,
            willChange: 'transform, opacity',
          }}
        />
      </div>
    </AnimatePresence>
  );
};
