import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sparkles, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

// ==========================================
// 1. PAGE & VIEW TRANSITION
// ==========================================
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1], // Natural ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 2. BASIC ENTRANCE ANIMATIONS
// ==========================================
interface MotionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<MotionProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp: React.FC<MotionProps & { distance?: number }> = ({
  children,
  delay = 0,
  duration = 0.35,
  distance = 12,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<MotionProps> = ({
  children,
  delay = 0,
  duration = 0.25,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// SCROLL-TRIGGERED ENTRANCE REVEAL (motion/react)
// ==========================================
interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  scale?: number;
  className?: string;
  viewportMargin?: string;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.45,
  direction = 'up',
  distance = 24,
  scale = 1,
  className = '',
  viewportMargin = '-40px',
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialOffset = () => {
    switch (direction) {
      case 'up': return { y: distance, x: 0 };
      case 'down': return { y: -distance, x: 0 };
      case 'left': return { x: distance, y: 0 };
      case 'right': return { x: -distance, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const offset = getInitialOffset();

  return (
    <motion.div
      initial={{ opacity: 0, scale, ...offset }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once, margin: viewportMargin }}
      transition={{
        duration,
        delay,
        ease: [0.21, 1, 0.36, 1], // fluid cubic bezier
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScrollStaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  viewportMargin?: string;
}> = ({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className = '',
  viewportMargin = '-40px',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScrollStaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  distance?: number;
}> = ({
  children,
  className = '',
  distance = 20,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 3. STAGGERED LIST & GRID CONTAINERS
// ==========================================
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.03,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 4. ANIMATED CARDS WITH MICRO-HOVER
// ==========================================
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={
        hoverEffect
          ? {
              y: -2,
              scale: 1.008,
              transition: { duration: 0.18, ease: 'easeOut' },
            }
          : undefined
      }
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 5. ANIMATED BUTTONS (PREMIUM MICRO-INTERACTIONS)
// ==========================================
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isAI?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  isAI = false,
  loading = false,
  loadingText,
  className = '',
  disabled,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <button className={className} disabled={disabled || loading} {...props}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{loadingText || 'Processing...'}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={
        disabled || loading
          ? undefined
          : {
              scale: 1.055,
              y: -2,
              transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
            }
      }
      whileTap={
        disabled || loading
          ? undefined
          : {
              scale: 0.94,
              y: 0,
              transition: { duration: 0.08, ease: 'easeInOut' },
            }
      }
      disabled={disabled || loading}
      className={`${className} relative cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed`}
      {...(props as any)}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          {isAI ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            </motion.span>
          ) : (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          <span>{loadingText || (isAI ? 'Thinking with AI...' : 'Loading...')}</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

// ==========================================
// 6. NUMBER COUNTING ANIMATION
// ==========================================
interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 750,
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = performance.now();

    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration, shouldReduceMotion]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// ==========================================
// 7. ANIMATED PROGRESS BAR
// ==========================================
interface AnimatedProgressBarProps {
  percentage: number;
  className?: string;
  barClassName?: string;
  duration?: number;
  delay?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percentage,
  className = 'h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden',
  barClassName = 'bg-blue-600 h-full rounded-full',
  duration = 0.65,
  delay = 0.1,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={className}>
      {shouldReduceMotion ? (
        <div className={barClassName} style={{ width: `${clampedPercentage}%` }} />
      ) : (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
          className={barClassName}
        />
      )}
    </div>
  );
};

// ==========================================
// 8. ANIMATED PROGRESS RING (CIRCULAR)
// ==========================================
interface AnimatedProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  percentage,
  size = 56,
  strokeWidth = 5,
  color = '#2563EB',
  trackColor = '#E2E8F0',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-40"
        />
        {shouldReduceMotion ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        ) : (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute text-[11px] font-bold tabular-nums">
        <AnimatedNumber value={clamped} suffix="%" />
      </div>
    </div>
  );
};

// ==========================================
// 9. NEURAL AI THINKING & LOADING ANIMATION
// ==========================================
interface AIThinkingAnimationProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export const AIThinkingAnimation: React.FC<AIThinkingAnimationProps> = ({
  message = 'Analyzing curriculum material with Gemini...',
  subMessage = 'Synthesizing objective assessment items & Bloom taxonomies',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
      {/* Neural Core Indicator */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer ambient glow pulse */}
        {!shouldReduceMotion && (
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 blur-md opacity-40"
          />
        )}

        {/* Orbiting Neural Ring */}
        {!shouldReduceMotion ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-full border-2 border-dashed border-[#7C3AED] dark:border-[#A855F7] opacity-75"
          />
        ) : (
          <div className="w-14 h-14 rounded-full border-2 border-[#7C3AED]" />
        )}

        {/* Center Node */}
        <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center shadow-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m10-10H2m15.07-7.07l-14.14 14.14M6.93 6.93l14.14 14.14" />
          </svg>
        </div>
      </div>

      {/* Intelligent Status Text */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          {message}
        </h4>
        {subMessage && (
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] max-w-sm">
            {subMessage}
          </p>
        )}
      </div>

      {/* Moving Neural Bar */}
      {!shouldReduceMotion && (
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 rounded-full"
          />
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. AI DOCUMENT-TO-QUESTION TRANSFORMATION ANIMATION
// ==========================================
export const DocumentTransformationAnimation: React.FC<{
  title?: string;
  sourceDocName?: string;
  step?: string;
}> = ({
  title = 'Transforming Curriculum into Verified Questions',
  sourceDocName = 'Course Material',
  step = 'Extracting Bloom-aligned concept nodes & distractor rationales...',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      {/* Transformation Flow Visualization */}
      <div className="flex items-center gap-4 sm:gap-8 justify-center relative">
        {/* Source Document */}
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.05, 1],
                  borderColor: ['#94A3B8', '#7C3AED', '#94A3B8'],
                }
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-20 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border-2 border-slate-300 dark:border-white/20 flex flex-col items-center justify-center p-2 shadow-xs relative"
        >
          <FileText className="w-7 h-7 text-[#2563EB] mb-1" />
          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate w-full">
            {sourceDocName}
          </span>
        </motion.div>

        {/* Neural Transformation Bridge */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="relative w-12 sm:w-20 h-0.5 bg-slate-200 dark:bg-slate-700 overflow-hidden">
            {!shouldReduceMotion && (
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          </div>
          <span className="text-[9px] font-mono text-[#7C3AED] dark:text-[#A855F7] font-semibold">
            Gemini 2.5
          </span>
        </div>

        {/* 3 Emerging Question Cards */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, (i - 1) * 8, 0],
                      x: [0, (i - 1) * 4, 0],
                      opacity: [0.7, 1, 0.7],
                    }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              style={{ zIndex: 3 - i }}
              className="absolute w-16 h-12 rounded-lg bg-white dark:bg-[#0A0D14] border border-blue-200 dark:border-[#00F0FF]/40 shadow-sm p-1.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[8px] font-bold text-[#2563EB]">
                <span>Q{i + 1}</span>
                <span className="text-[7px] text-[#10B981]">MCQ</span>
              </div>
              <div className="space-y-0.5">
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="w-3/4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Label and Step */}
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          {title}
        </h3>
        <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
          {step}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 11. AI RECOMMENDATION / HIGHLIGHT CARD
// ==========================================
interface AIRecommendationCardProps {
  children: React.ReactNode;
  isImportant?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  children,
  isImportant = false,
  className = '',
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        onClick={onClick}
        className={`${className} rounded-xl border ${
          isImportant
            ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20'
            : 'border-[#E2E8F0] dark:border-[#334155]'
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -3,
        scale: 1.01,
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      onClick={onClick}
      className={`relative rounded-xl border transition-shadow ${
        isImportant
          ? 'border-purple-300/80 dark:border-purple-500/40 shadow-[0_0_15px_-3px_rgba(124,58,237,0.25)] bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-[#0A0D14] dark:via-purple-950/30 dark:to-[#0A0D14]'
          : 'border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#0A0D14]'
      } ${className}`}
    >
      {isImportant && (
        <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#7C3AED] text-white shadow-xs">
          AI Suggested
        </span>
      )}
      {children}
    </motion.div>
  );
};

// ==========================================
// 12. AI TUTOR TYPING INDICATOR
// ==========================================
export const TypingIndicator: React.FC<{ label?: string }> = ({ label = 'AI Tutor is thinking...' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-xs text-xs text-[#2563EB] dark:text-[#3B82F6]">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4],
                  }
            }
            transition={{
              duration: 0.75,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
            className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] inline-block"
          />
        ))}
      </div>
      <span className="font-semibold text-[11px]">{label}</span>
    </div>
  );
};
