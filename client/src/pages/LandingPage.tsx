import {useEffect, useMemo, useState} from "react";
import {FeatureCard} from "../components/landing/FeatureCard";
import {HeroRaceWindow} from "../components/landing/HeroRaceWindow";
import {MiniRacePreview} from "../components/landing/MiniRacePreview";
import {MiniStepsPreview} from "../components/landing/MiniStepsPreview";
import {MiniSearchPreview} from "../components/landing/MiniSearchPreview";
import {MiniSecurityPreview} from "../components/landing/MiniSecurityPreview";
import {MiniFilesPreview} from "../components/landing/MiniFilesPreview";
import {MiniRanksPreview} from "../components/landing/MiniRanksPreview";
import {ProfileLeaderboardSection} from "../components/landing/ProfileLeaderboardSection";
import {PracticeModal} from "../components/practice/PracticeModal";
import {ButtonLink} from "../components/ui/ButtonLink";
import {MobileWarningModal} from "../components/ui/MobileWarningModal";
import {usePlatformStats} from "../lib/usePlatformStats";
import {useIsMobile} from "../lib/useIsMobile";
import type {
  FilesPreviewData,
  LaneFrame,
  LaneKey,
  RanksPreviewData,
  SearchPreviewData,
  SecurityPreviewData,
  StepsPreviewData,
} from "../components/landing/types";
import {useUIStore} from "../store/uiStore";

/* ── Race animation constants ── */
const LOOP_MS = 18000;
const COUNTDOWN_MS = 3000;
const FINISH_MS = 2200;
const RACE_MS = LOOP_MS - COUNTDOWN_MS - FINISH_MS;

const laneTracks: Record<LaneKey, LaneFrame[]> = {
  alpha: [
    {t: 0, value: 18},
    {t: 20, value: 42},
    {t: 40, value: 64},
    {t: 43, value: 70},
    {t: 44, value: 69},
    {t: 60, value: 66},
    {t: 79, value: 62},
    {t: 80, value: 61},
    {t: 90, value: 59},
    {t: 96, value: 57},
  ],
  beta: [
    {t: 0, value: 14},
    {t: 20, value: 36},
    {t: 40, value: 61},
    {t: 43, value: 68},
    {t: 44, value: 70},
    {t: 60, value: 80},
    {t: 79, value: 83},
    {t: 80, value: 82},
    {t: 90, value: 78},
    {t: 96, value: 74},
  ],
  gamma: [
    {t: 0, value: 12},
    {t: 20, value: 30},
    {t: 40, value: 50},
    {t: 43, value: 58},
    {t: 44, value: 59},
    {t: 60, value: 67},
    {t: 79, value: 74},
    {t: 80, value: 76},
    {t: 90, value: 84},
    {t: 96, value: 100},
  ],
};

function interpolateTrack(frames: LaneFrame[], tPercent: number): number {
  for (let i = 0; i < frames.length - 1; i += 1) {
    const start = frames[i];
    const end = frames[i + 1];
    if (tPercent >= start.t && tPercent <= end.t) {
      const span = end.t - start.t;
      if (span <= 0) {
        return end.value;
      }
      const p = (tPercent - start.t) / span;
      return start.value + (end.value - start.value) * p;
    }
  }
  return frames[frames.length - 1]?.value ?? 0;
}

function finalRaceValue(frames: LaneFrame[]): number {
  if (frames.length < 1) {
    return frames[0]?.value ?? 0;
  }
  return frames[frames.length - 1].value;
}

function calcWpm(base: number, progress: number): string {
  return (base + progress * 0.24).toFixed(1);
}

/* ── Card animation constants ── */
const STEPS_LOOP_MS = 6000;
const SEARCH_LOOP_MS = 10000;
const SECURITY_LOOP_MS = 9000;
const FILES_LOOP_MS = 8000;
const RANKS_LOOP_MS = 8000;

const SEARCH_WORDS = ["go", "php", "mixed"];
const FILE_NAMES = [
  "race-2026-03-13.log",
  "room-22.snapshot",
  "leaderboard.cache",
];

/* Ranks: each category climbs through these values */
const RANK_TRACKS = [
  [5, 3, 1], // speed
  [8, 5, 3], // accuracy
  [12, 7, 5], // wins
];

export function LandingPage() {
  const reducedEffects = useUIStore((state) => state.reducedEffects);
  const [tick, setTick] = useState(() => Date.now());
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  const platformStats = usePlatformStats();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reducedEffects) {
      return;
    }

    const interval = window.setInterval(() => {
      setTick(Date.now());
    }, 120);

    return () => {
      window.clearInterval(interval);
    };
  }, [reducedEffects]);

  /* ── Race data (existing) ── */
  const raceData = useMemo(() => {
    if (reducedEffects) {
      const fixed = {alpha: 62, beta: 58, gamma: 53};
      return {
        progress: fixed,
        lead: "alpha" as LaneKey,
        isCountdown: false,
        isFinish: false,
        finishElapsedMs: 0,
        countdown: 0,
        round: 0,
        wpm: {
          alpha: calcWpm(78, fixed.alpha),
          beta: calcWpm(75, fixed.beta),
          gamma: calcWpm(72, fixed.gamma),
        },
      };
    }

    const cycleTime = tick % LOOP_MS;
    const round = Math.floor(tick / LOOP_MS);
    if (cycleTime < COUNTDOWN_MS) {
      return {
        progress: {alpha: 0, beta: 0, gamma: 0},
        lead: "alpha" as LaneKey,
        isCountdown: true,
        isFinish: false,
        finishElapsedMs: 0,
        countdown: 3 - Math.floor(cycleTime / 1000),
        round,
        wpm: {
          alpha: "0.0",
          beta: "0.0",
          gamma: "0.0",
        },
      };
    }

    const raceTime = cycleTime - COUNTDOWN_MS;
    if (raceTime > RACE_MS) {
      const finishElapsedMs = raceTime - RACE_MS;
      const finalProgress = {
        alpha: finalRaceValue(laneTracks.alpha),
        beta: finalRaceValue(laneTracks.beta),
        gamma: finalRaceValue(laneTracks.gamma),
      };
      return {
        progress: finalProgress,
        lead: "gamma" as LaneKey,
        isCountdown: false,
        isFinish: true,
        finishElapsedMs,
        countdown: 0,
        round,
        wpm: {
          alpha: calcWpm(78, finalProgress.alpha),
          beta: calcWpm(75, finalProgress.beta),
          gamma: calcWpm(72, finalProgress.gamma),
        },
      };
    }

    const tPercent = (raceTime / RACE_MS) * 100;
    const progress = {
      alpha: interpolateTrack(laneTracks.alpha, tPercent),
      beta: interpolateTrack(laneTracks.beta, tPercent),
      gamma: interpolateTrack(laneTracks.gamma, tPercent),
    };

    let lead: LaneKey = "alpha";
    if (progress.beta > progress[lead]) {
      lead = "beta";
    }
    if (progress.gamma > progress[lead]) {
      lead = "gamma";
    }

    return {
      progress,
      lead,
      isCountdown: false,
      isFinish: false,
      finishElapsedMs: 0,
      countdown: 0,
      round,
      wpm: {
        alpha: calcWpm(78, progress.alpha),
        beta: calcWpm(75, progress.beta),
        gamma: calcWpm(72, progress.gamma),
      },
    };
  }, [reducedEffects, tick]);

  const settledWinnerState =
    raceData.isFinish && raceData.finishElapsedMs > 700;

  /* ── Steps data (Card 4: Fast Match Loop) ── */
  const stepsData = useMemo<StepsPreviewData>(() => {
    if (reducedEffects) {
      return {activeIndex: 2}; // Countdown active, Queue+Match complete
    }
    const cycle = tick % STEPS_LOOP_MS;
    const activeIndex =
      cycle < 1200
        ? 0
        : cycle < 2400
          ? 1
          : cycle < 3600
            ? 2
            : cycle < 4800
              ? 3
              : cycle < 5400
                ? 4 // all complete
                : -1; // resetting
    return {activeIndex};
  }, [reducedEffects, tick]);

  /* ── Search data (Card 1: Language Hubs) ── */
  const searchData = useMemo<SearchPreviewData>(() => {
    if (reducedEffects) {
      return {typedText: "go", activePill: "go", showCursor: false};
    }
    const cycle = tick % SEARCH_LOOP_MS;

    // Three word phases, each: type (chars) → hold → clear
    // Word 0 "go":    0-800 type, 800-2800 hold, 2800-3200 clear
    // Word 1 "php":   3200-4400 type, 4400-6200 hold, 6200-6600 clear
    // Word 2 "mixed": 6600-8600 type, 8600-9600 hold, 9600-10000 clear
    const phases = [
      {
        word: SEARCH_WORDS[0],
        typeStart: 0,
        typeEnd: 800,
        holdEnd: 2800,
        clearEnd: 3200,
      },
      {
        word: SEARCH_WORDS[1],
        typeStart: 3200,
        typeEnd: 4400,
        holdEnd: 6200,
        clearEnd: 6600,
      },
      {
        word: SEARCH_WORDS[2],
        typeStart: 6600,
        typeEnd: 8600,
        holdEnd: 9600,
        clearEnd: 10000,
      },
    ];

    for (const phase of phases) {
      if (cycle >= phase.typeStart && cycle < phase.clearEnd) {
        if (cycle < phase.typeEnd) {
          // Typing phase
          const elapsed = cycle - phase.typeStart;
          const typeDuration = phase.typeEnd - phase.typeStart;
          const charIndex = Math.floor(
            (elapsed / typeDuration) * (phase.word.length + 1),
          );
          const typedText = phase.word.slice(
            0,
            Math.min(charIndex, phase.word.length),
          );
          return {
            typedText,
            activePill: typedText === phase.word ? phase.word : null,
            showCursor: true,
          };
        }
        if (cycle < phase.holdEnd) {
          // Hold phase — full word typed, pill active
          return {
            typedText: phase.word,
            activePill: phase.word,
            showCursor: true,
          };
        }
        // Clear phase — erasing
        const clearElapsed = cycle - phase.holdEnd;
        const clearDuration = phase.clearEnd - phase.holdEnd;
        const charsLeft = Math.max(
          0,
          phase.word.length -
          Math.floor(
            (clearElapsed / clearDuration) * (phase.word.length + 1),
          ),
        );
        return {
          typedText: phase.word.slice(0, charsLeft),
          activePill: charsLeft > 0 ? phase.word : null,
          showCursor: true,
        };
      }
    }

    return {typedText: "", activePill: null, showCursor: true};
  }, [reducedEffects, tick]);

  /* ── Security data (Card 5: Fairness Controls) ── */
  const securityData = useMemo<SecurityPreviewData>(() => {
    if (reducedEffects) {
      return {visibleCount: 3, isClearing: false, entryIndex: -1};
    }
    const cycle = tick % SECURITY_LOOP_MS;
    if (cycle >= 7500) {
      return {visibleCount: 3, isClearing: true, entryIndex: -1};
    }
    const visibleCount = cycle < 2500 ? 1 : cycle < 5000 ? 2 : 3;
    // Determine which event just entered (within 400ms of appearing)
    let entryIndex = -1;
    if (cycle < 400) entryIndex = 0;
    else if (cycle >= 2500 && cycle < 2900) entryIndex = 1;
    else if (cycle >= 5000 && cycle < 5400) entryIndex = 2;

    return {visibleCount, isClearing: false, entryIndex};
  }, [reducedEffects, tick]);

  /* ── Files data (Card 3: Persistent Results) ── */
  const filesData = useMemo<FilesPreviewData>(() => {
    if (reducedEffects) {
      return {
        files: FILE_NAMES.map(() => ({
          charCount: 999,
          isSaved: true,
          isVisible: true,
        })),
        isFading: false,
      };
    }
    const cycle = tick % FILES_LOOP_MS;
    const isFading = cycle >= 6500;

    // File 0: visible 0ms, types 0-1200ms, saved at 1200ms
    // File 1: visible 1500ms, types 1500-2700ms, saved at 2700ms
    // File 2: visible 3000ms, types 3000-4200ms, saved at 4200ms
    const fileTimings = [
      {visibleAt: 0, typeStart: 0, typeEnd: 1200, savedAt: 1200},
      {visibleAt: 1500, typeStart: 1500, typeEnd: 2700, savedAt: 2700},
      {visibleAt: 3000, typeStart: 3000, typeEnd: 4200, savedAt: 4200},
    ];

    const files = FILE_NAMES.map((name, i) => {
      const t = fileTimings[i];
      const isVisible = cycle >= t.visibleAt;

      if (!isVisible) {
        return {charCount: 0, isSaved: false, isVisible: false};
      }

      let charCount: number;
      if (cycle < t.typeStart) {
        charCount = 0;
      } else if (cycle < t.typeEnd) {
        const elapsed = cycle - t.typeStart;
        const duration = t.typeEnd - t.typeStart;
        charCount = Math.floor((elapsed / duration) * name.length);
      } else {
        charCount = name.length;
      }

      const isSaved = cycle >= t.savedAt;
      return {charCount, isSaved, isVisible: true};
    });

    return {files, isFading};
  }, [reducedEffects, tick]);

  /* ── Ranks data (Card 6: Seasonal Climb) ── */
  const ranksData = useMemo<RanksPreviewData>(() => {
    if (reducedEffects) {
      return {
        ranks: RANK_TRACKS.map((track) => ({
          value: track[track.length - 1],
          prevValue: null,
          isClimbing: false,
        })),
        isSettled: true,
        isVisible: true,
      };
    }
    const cycle = tick % RANKS_LOOP_MS;
    const isVisible = cycle >= 200;

    if (!isVisible) {
      return {
        ranks: RANK_TRACKS.map((track) => ({
          value: track[0],
          prevValue: null,
          isClimbing: false,
        })),
        isSettled: false,
        isVisible: false,
      };
    }

    // Each category climbs at staggered times
    // Speed:    changes at 1000ms, 2000ms (3 values: 5→3→1)
    // Accuracy: changes at 3000ms, 4000ms (3 values: 8→5→3)
    // Wins:     changes at 5000ms, 6000ms (3 values: 12→7→5)
    const categoryOffsets = [1000, 3000, 5000];
    const climbInterval = 1000; // 1s between rank changes
    const climbFlashDuration = 400;

    const ranks = RANK_TRACKS.map((track, i) => {
      const catStart = categoryOffsets[i];
      const elapsed = cycle - catStart;

      if (elapsed < 0) {
        // Not started climbing yet
        return {value: track[0], prevValue: null, isClimbing: false};
      }

      const stepIndex = Math.min(
        Math.floor(elapsed / climbInterval),
        track.length - 1,
      );
      const value = track[stepIndex];
      const prevValue = stepIndex > 0 ? track[stepIndex - 1] : null;

      // Flash "climbing" for a short duration after each step change
      const timeSinceStep = elapsed - stepIndex * climbInterval;
      const isClimbing = stepIndex > 0 && timeSinceStep < climbFlashDuration;

      return {value, prevValue, isClimbing};
    });

    const isSettled = cycle >= 7000;
    return {ranks, isSettled, isVisible: true};
  }, [reducedEffects, tick]);

  return (
    <main
      className={
        reducedEffects
          ? "layout reduced mx-auto max-w-7xl px-6"
          : "layout mx-auto max-w-7xl px-6"
      }
    >
      <div className="nebula hidden" aria-hidden="true"/>
      <div className="scanline hidden" aria-hidden="true"/>
      <div className="grid-overlay" aria-hidden="true"/>
      <div className="hero-vignette hidden" aria-hidden="true"/>

      <section className="mb-10 mt-10 flex flex-col items-center text-center sm:mb-14 sm:mt-16 md:mt-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <div className="hero-orb animate-in a1" aria-hidden="true">
            <span className="hero-orb-core">
              <span className="">{"{"}</span>
              <span className="" style={{opacity: 0.5}}>
                {"}"}
              </span>
            </span>
          </div>

          <p className="kicker animate-in a2">Realtime code typing arena</p>
          <div className="hero-title-wrap animate-in a3">
            <h1 className="hero-title font-bold">Type faster. Win cleaner.</h1>
          </div>
          <p className="subtitle hero-subtitle animate-in a4">
            Enter focused language hubs, race on real snippets, and climb live
            leaderboards with server-authoritative scoring.
          </p>

          <div className="actions animate-in a6 justify-center">
            {isMobile ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-base font-semibold tracking-tight transition-all duration-200 bg-gradient-to-r from-accent to-accent-strong text-[#2b1300] hover:-translate-y-0.5"
                onClick={() => setMobileWarningOpen(true)}
              >
                Play Now
              </button>
            ) : (
              <ButtonLink to="/race" variant="primary">
                Play Now
              </ButtonLink>
            )}
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() =>
                isMobile ? setMobileWarningOpen(true) : setPracticeOpen(true)
              }
            >
              Practice
            </button>
          </div>

          <div className="hero-meta animate-in a7">
            <span>
              <strong>{platformStats.onlinePlayers.toLocaleString()}</strong>{" "}
              online players
            </span>
            <span>
              <strong>{platformStats.activeHubs.toLocaleString()}</strong>{" "}
              active hubs
            </span>
            <span>
              <strong>{platformStats.totalRaces.toLocaleString()}</strong> races
              played
            </span>
          </div>
        </div>

        <HeroRaceWindow/>
      </section>

      <section className="spacious-section px-2 text-center sm:px-0">
        <h2
          className="mx-auto max-w-4xl font-sans text-2xl font-semibold tracking-tight text-[#fff0e2] sm:text-3xl md:text-5xl">
          Understand the concept in one glance
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[#cbb9a7] md:text-base">
          Competitive typing built for code: local-first stats, live race state,
          and ranked progression per hub.
        </p>
      </section>

      <section
        className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
        aria-label="Core concept grid"
      >
        <FeatureCard
          title="Language Hubs"
          description="Queue into focused hubs per stack and keep your rankings separated by context."
          preview={<MiniSearchPreview data={searchData}/>}
        />

        <FeatureCard
          title="Realtime Race Feed"
          description="Every lane updates continuously so players can react, recover, and push for position."
          preview={
            <MiniRacePreview
              raceData={raceData}
              settledWinnerState={settledWinnerState}
            />
          }
        />

        <FeatureCard
          title="Persistent Results"
          description="Finished races are written to Postgres so profiles and leaderboards are always auditable."
          preview={<MiniFilesPreview data={filesData}/>}
        />

        <FeatureCard
          title="Fast Match Loop"
          description="Short queue cycles and deterministic room assignment keep gameplay snappy and focused."
          preview={<MiniStepsPreview data={stepsData}/>}
        />

        <FeatureCard
          title="Fairness Controls"
          description="Server-side input validation protects races from impossible progress jumps and macro-like behavior."
          preview={<MiniSecurityPreview data={securityData}/>}
        />

        <FeatureCard
          title="Seasonal Climb"
          description="Track speed, accuracy, and wins as separate competitive ladders for long-term progression."
          preview={<MiniRanksPreview data={ranksData}/>}
        />
      </section>

      {/*<EngagementSection*/}
      {/*  reducedEffects={reducedEffects}*/}
      {/*  races24h={platformStats.races24h}*/}
      {/*  playersOnline={platformStats.onlinePlayers}*/}
      {/*/>*/}

      <ProfileLeaderboardSection/>

      <PracticeModal
        open={practiceOpen}
        onClose={() => setPracticeOpen(false)}
      />
      <MobileWarningModal
        open={mobileWarningOpen}
        onClose={() => setMobileWarningOpen(false)}
      />
    </main>
  );
}
