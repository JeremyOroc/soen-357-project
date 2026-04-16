// Three-slide onboarding walkthrough shown on first launch.
// Introduces the app philosophy: show up, tap once, watch the ring fill.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'kmf_onboarded';

const SLIDES = [
  {
    emoji: '🏃',
    title: 'Welcome to KeepMovingForward',
    message: 'This app rewards you for showing up, not for how much you lift.',
    bg: 'from-brand-600/20 to-brand-500/5',
  },
  {
    emoji: '👆',
    title: 'One Tap. That\'s it.',
    message: 'When you finish a workout, just hit the big button. No sets, no reps, no pressure.',
    bg: 'from-indigo-600/20 to-indigo-500/5',
  },
  {
    emoji: '💜',
    title: 'Watch your ring fill up',
    message: 'Every day you check in, your weekly ring grows. Build the habit, one day at a time.',
    bg: 'from-violet-600/20 to-violet-500/5',
  },
] as const;

export default function Onboarding({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  // On the last slide this marks onboarding complete and goes to Dashboard
  function handleNext() {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete?.();
      navigate('/');
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0d1a] flex flex-col items-center justify-between px-6 py-12 select-none">

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <div
          role="region"
          aria-label={`Onboarding step ${step + 1} of ${SLIDES.length}: ${slide.title}`}
          key={step}
          className="w-full flex flex-col items-center gap-6 animate-fade-in"
        >
          {/* Emoji illustration */}
          <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${slide.bg} flex items-center justify-center shadow-inner`}>
            <span className="text-7xl" role="img" aria-hidden="true">{slide.emoji}</span>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              {slide.title}
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {slide.message}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Dot indicators */}
        <div className="flex gap-2" role="tablist" aria-label="Onboarding progress">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === step}
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 h-2 bg-brand-500'
                  : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-brand-400'
              }`}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={handleNext}
          aria-label={isLast ? 'Get started with KeepMovingForward' : `Go to step ${step + 2}`}
          className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-semibold text-base tracking-wide shadow-lg shadow-brand-600/30 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/60"
        >
          {isLast ? 'Get Started' : 'Next →'}
        </button>

        {/* Skip link — not on last slide */}
        {!isLast && (
          <button
            onClick={() => {
              localStorage.setItem(ONBOARDING_KEY, 'true');
              onComplete?.();
              navigate('/');
            }}
            aria-label="Skip onboarding"
            className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

export { ONBOARDING_KEY };
