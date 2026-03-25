export function HeroRaceWindow() {
  const players = [
    {
      name: 'player-alpha',
      avatar: '/avatar/s12.png',
      wpm: '92.4',
      accuracy: '98.1%',
      avg: '89.8',
      streak: 'x42',
      progress: '84%',
      laneClass: 'lane-a',
    },
    {
      name: 'player-beta',
      avatar: '/avatar/s12312.png',
      wpm: '87.1',
      accuracy: '96.4%',
      avg: '84.2',
      streak: 'x29',
      progress: '76%',
      laneClass: 'lane-b',
    },
    {
      name: 'player-gamma',
      avatar: '/avatar/s12312a.png',
      wpm: '81.8',
      accuracy: '95.8%',
      avg: '80.1',
      streak: 'x21',
      progress: '69%',
      laneClass: 'lane-c',
    },
    {
      name: 'player-delta',
      avatar: '/avatar/s12312abewq.png',
      wpm: '79.5',
      accuracy: '94.7%',
      avg: '78.2',
      streak: 'x19',
      progress: '64%',
      laneClass: 'lane-b',
    },
    {
      name: 'player-epsilon',
      avatar: '/avatar/s12312abewqqwq.png',
      wpm: '76.3',
      accuracy: '94.1%',
      avg: '75.6',
      streak: 'x16',
      progress: '61%',
      laneClass: 'lane-a',
    },
    {
      name: 'player-zeta',
      avatar: '/avatar/s12.png',
      wpm: '75.1',
      accuracy: '93.8%',
      avg: '74.4',
      streak: 'x14',
      progress: '59%',
      laneClass: 'lane-c',
    },
    {
      name: 'guest-runner',
      wpm: '74.6',
      accuracy: '93.9%',
      avg: '72.5',
      streak: 'x13',
      progress: '58%',
      laneClass: 'lane-guest',
      isGuest: true,
    },
  ]

  return (
    <aside
      className="animate-in a6 mt-10 w-full overflow-hidden rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,15,11,0.94),rgba(9,7,6,0.98))] sm:rounded-[24px]"
      aria-label="Race preview window"
    >
      <div className="relative flex items-center justify-end gap-2 border-b border-white/10 bg-[linear-gradient(90deg,rgba(25,17,12,0.9),rgba(18,12,9,0.9))] px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <p className="pointer-events-none absolute left-1/2 m-0 -translate-x-1/2 text-center text-[0.6rem] tracking-[0.08em] text-[#ceb49b] sm:text-[0.7rem]">
          race://sprint-go-2p
        </p>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-white/20 bg-white/8 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.08em] text-[#d9dde4]">
            HUB: GO
          </span>
          <span className="rounded-full border border-white/20 bg-white/8 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.08em] live-pill text-[#2b1300]">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 hero:grid-cols-[1.3fr_1fr] hero:p-5">
        <div className="rounded-xl border border-white/10 bg-[rgba(15,11,9,0.84)] p-3 text-left sm:p-4">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[0.62rem] uppercase tracking-[0.1em] text-[#aa9a8b]">snippet.go</span>
            <span className="text-[0.62rem] uppercase tracking-[0.1em] text-[#aa9a8b]">difficulty: mid</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#0f0b09]/85 px-2 py-2 text-left sm:px-3 sm:py-2.5">
            <div className="editor-grid grid grid-cols-[auto_1fr] gap-x-2 font-mono text-[0.72rem] leading-[1.72] text-[#efdfd0] text-left sm:gap-x-4 sm:text-[0.96rem]">
              <span className="text-right text-[#7f7267]">1</span>
              <span>
                <span className="text-[#ffb966]">package</span> main
              </span>
              <span className="text-right text-[#7f7267]">2</span>
              <span />
              <span className="text-right text-[#7f7267]">3</span>
              <span>
                <span className="text-[#ffb966]">import</span> (
              </span>
              <span className="text-right text-[#7f7267]">4</span>
              <span>
                {'  '}<span className="text-[#ffcf94]">"fmt"</span>
              </span>
              <span className="text-right text-[#7f7267]">5</span>
              <span>
                {'  '}<span className="text-[#ffcf94]">"time"</span>
              </span>
              <span className="text-right text-[#7f7267]">6</span>
              <span>)</span>
              <span className="text-right text-[#7f7267]">7</span>
              <span />
              <span className="text-right text-[#7f7267]">8</span>
              <span>
                <span className="text-[#ffb966]">func</span> <span className="text-[#ffe7cc]">main</span>() {'{'}
              </span>
              <span className="text-right text-[#7f7267]">9</span>
              <span>
                {'  '}tasks := []<span className="text-[#ffc787]">string</span>{'{'}<span className="text-[#ffcf94]">"build"</span>, <span className="text-[#ffcf94]">"test"</span>, <span className="text-[#ffcf94]">"deploy"</span>{'}'}
              </span>
              <span className="text-right text-[#7f7267]">10</span>
              <span />
              <span className="text-right text-[#7f7267]">11</span>
              <span>
                {'  '}start := time.<span className="text-[#ffe7cc]">Now</span>()
              </span>
              <span className="text-right text-[#7f7267]">12</span>
              <span>
                {'  '}<span className="text-[#ffb966]">for</span> i, t := <span className="text-[#ffb966]">range</span> tasks {'{'}
              </span>
              <span className="text-right text-[#7f7267]">13</span>
              <span>
                {'    '}fmt.<span className="text-[#ffe7cc]">Printf</span>(<span className="text-[#ffcf94]">"Step %d: %s\\n"</span>, i+1, t)
              </span>
              <span className="text-right text-[#7f7267]">14</span>
              <span>
                {'    '}time.<span className="text-[#ffe7cc]">Sleep</span>(200 * time.Millisecond)
              </span>
              <span className="text-right text-[#7f7267]">15</span>
              <span>{'  }'}</span>
              <span className="text-right text-[#7f7267]">16</span>
              <span />
              <span className="text-right text-[#7f7267]">17</span>
              <span>
                {'  '}fmt.<span className="text-[#ffe7cc]">Printf</span>(<span className="text-[#ffcf94]">"Pipeline finished in %v\\n"</span>, time.<span className="text-[#ffe7cc]">Since</span>(start))
              </span>
              <span className="text-right text-[#7f7267]">18</span>
              <span>{'}'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[0.62rem] uppercase tracking-[0.08em] text-[#8d7f72]">
              <span>utf-8</span>
              <span>go</span>
              <span>line 18, col 1</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[rgba(15,11,9,0.84)] p-2.5 sm:p-3.5">
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-[#120d0b]/70 px-2 py-1 text-center">
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-[#9f8b78]">avg wpm</div>
              <div className="text-[0.82rem] font-semibold text-[#f6e4cf]">84.0</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#120d0b]/70 px-2 py-1 text-center">
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-[#9f8b78]">accuracy</div>
              <div className="text-[0.82rem] font-semibold text-[#f6e4cf]">96.1%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#120d0b]/70 px-2 py-1 text-center">
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-[#9f8b78]">active</div>
              <div className="text-[0.82rem] font-semibold text-[#f6e4cf]">6/7</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#120d0b]/70 px-2 py-1 text-center">
              <div className="text-[0.62rem] uppercase tracking-[0.08em] text-[#9f8b78]">delta</div>
              <div className="text-[0.82rem] font-semibold text-[#f6e4cf]">+6.2</div>
            </div>
          </div>

          {players.map((player) => (
            <div key={player.name} className={`lane ${player.isGuest ? 'opacity-55' : ''}`}>
              <div className="lane-meta">
                <span className="inline-flex items-center gap-1.5 truncate">
                  {player.isGuest ? null : (
                    <img
                      src={player.avatar}
                      alt={`${player.name} avatar`}
                      className="h-[18px] w-[18px] flex-shrink-0 rounded-full border border-white/15 object-cover sm:h-[22px] sm:w-[22px]"
                    />
                  )}
                  <span className="truncate">{player.name}</span>
                  {player.isGuest ? (
                    <em className="rounded-full border border-white/16 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-[0.08em] text-[#d7d9dd]">
                      guest
                    </em>
                  ) : null}
                </span>
                <span className="flex-shrink-0 whitespace-nowrap text-[0.65rem] sm:text-[0.77rem]">
                  {player.wpm} WPM | {player.accuracy}
                </span>
              </div>
              <div className="lane-track">
                <div className={`lane-progress ${player.laneClass}`} style={{ width: player.progress }} />
              </div>
              <div className="mt-1 hidden gap-2 text-[0.62rem] text-[#9c8d80] sm:flex">
                <span>avg {player.avg}</span>
                <span>streak {player.streak}</span>
                <span>{player.isGuest ? 'no leaderboard' : 'ranked'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
