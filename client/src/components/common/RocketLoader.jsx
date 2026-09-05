import React, { useId } from 'react';
import { Rocket } from 'lucide-react';

/**
 * RocketLoader
 * Custom branded circular orbiting rocket loader for CodePilot.
 *
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} size - Dimension scale of the loader
 * @param {string | null} text - Optional title or message below the loader
 * @param {string | null} subtitle - Optional secondary helper message
 * @param {boolean} fullPage - If true, renders full viewport centered screen
 * @param {'normal' | 'fast' | 'slow'} speed - Speed of orbit rotation
 * @param {string} className - Optional outer wrapper styling
 */
const RocketLoader = ({
  size = 'md',
  text = null,
  subtitle = null,
  fullPage = false,
  speed = 'normal',
  className = '',
}) => {
  const rawId = useId();
  const gradId = `rk-grad-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Dimensions & scaling based on size prop
  const config = {
    xs: {
      box: 'w-6 h-6',
      svgView: 100,
      radius: 36,
      strokeWidth: 4,
      rocketSize: 'h-2.5 w-2.5',
      coreSize: 'w-1.5 h-1.5',
      fontSize: 'text-[10px]',
      gap: 'gap-1.5',
    },
    sm: {
      box: 'w-10 h-10',
      svgView: 100,
      radius: 36,
      strokeWidth: 3,
      rocketSize: 'h-3.5 w-3.5',
      coreSize: 'w-2 h-2',
      fontSize: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      box: 'w-16 h-16',
      svgView: 100,
      radius: 36,
      strokeWidth: 2.5,
      rocketSize: 'h-5 w-5',
      coreSize: 'w-3 h-3',
      fontSize: 'text-xs sm:text-sm',
      gap: 'gap-3',
    },
    lg: {
      box: 'w-24 h-24',
      svgView: 100,
      radius: 36,
      strokeWidth: 2.5,
      rocketSize: 'h-6 w-6',
      coreSize: 'w-4 h-4',
      fontSize: 'text-sm sm:text-base',
      gap: 'gap-3.5',
    },
    xl: {
      box: 'w-32 h-32',
      svgView: 100,
      radius: 36,
      strokeWidth: 2,
      rocketSize: 'h-8 w-8',
      coreSize: 'w-5 h-5',
      fontSize: 'text-base sm:text-lg',
      gap: 'gap-4',
    },
  }[size] || config?.md;

  const speedClass = {
    fast: 'animate-rocket-orbit-fast',
    normal: 'animate-rocket-orbit',
    slow: 'animate-rocket-orbit-slow',
  }[speed] || 'animate-rocket-orbit';

  // Geometry:
  // Center is (50, 50), Radius R = 36.
  // Rocket is at 12 o'clock => (50, 50 - 36) = (50, 14).
  // Arc sweeps clockwise from 9 o'clock (14, 50) to 12 o'clock (50, 14).
  const arcPath = `M 14 50 A 36 36 0 0 1 50 14`;

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center ${config.gap} ${className}`}>
      {/* Orbit & Rocket Container */}
      <div className={`relative flex items-center justify-center ${config.box} shrink-0`}>
        {/* Background Dashed Guide Orbit */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 5"
            strokeWidth="1.2"
            className="text-slate-200/90 dark:text-slate-700/60"
          />
        </svg>

        {/* Pulsing Central Planet / Core */}
        <div className="relative flex items-center justify-center pointer-events-none">
          <div
            className={`rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 ${config.coreSize} shadow-md shadow-brand-500/40 animate-pulse`}
          />
          <div
            className={`absolute rounded-full bg-brand-400/30 ${config.coreSize} scale-150 animate-ping opacity-40`}
          />
        </div>

        {/* Orbiting Rotating Arm (Clockwise 360 Spin) */}
        <div className={`absolute inset-0 ${speedClass} pointer-events-none`}>
          {/* Glowing Arc Trail */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
                <stop offset="60%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="90%" stopColor="#ec4899" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d={arcPath}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
            />
          </svg>

          {/* Rocket at 12 o'clock apex, oriented forward (East) */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: '14%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Thruster Flame Particle */}
            <span
              className="absolute rounded-full bg-gradient-to-r from-orange-400 to-amber-300 blur-[0.5px] opacity-90 animate-pulse"
              style={{
                width: size === 'xs' ? '4px' : size === 'sm' ? '6px' : '9px',
                height: size === 'xs' ? '2px' : size === 'sm' ? '3px' : '4px',
                transform: 'translate(-80%, 0)',
              }}
            />

            {/* Rocket Icon (Rotated 45 deg to point East along tangent) */}
            <div className="transform rotate-45 text-brand-600 drop-shadow-[0_2px_8px_rgba(99,102,241,0.5)]">
              <Rocket className={config.rocketSize} fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {/* Optional Text Message */}
      {(text || subtitle) && (
        <div className="flex flex-col items-center text-center max-w-xs animate-fade-in">
          {text && (
            <p className={`${config.fontSize} font-bold text-slate-700 tracking-tight flex items-center gap-1.5`}>
              <span>{text}</span>
            </p>
          )}
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/80 backdrop-blur-sm px-4">
        <div className="p-8 rounded-3xl bg-white/90 border border-slate-200/90 shadow-soft-lg flex flex-col items-center">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default RocketLoader;
