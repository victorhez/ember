import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useStore } from './state/store'
import { Welcome } from './components/Welcome'
import { Header, type View } from './components/Header'
import { Today } from './components/Today'
import { Pattern } from './components/Pattern'
import { SettingsSheet } from './components/SettingsSheet'
import { useResolvedTheme } from './components/useTheme'

export default function App() {
  const { state } = useStore()
  const [view, setView] = useState<View>('today')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const theme = useResolvedTheme(state.settings.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'day' ? '#f6efe5' : '#0d0a08')
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view, state.onboarded])

  return (
    <MotionConfig reducedMotion="user">
      <div className="backdrop" aria-hidden />
      <AnimatePresence mode="wait">
        {!state.onboarded ? (
          <motion.div key="welcome" exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }} transition={{ duration: 0.45 }}>
            <Welcome />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="shell"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Header view={view} onView={setView} onSettings={() => setSettingsOpen(true)} />
            <main id="main">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {view === 'today' ? <Today onOpenPattern={() => setView('pattern')} /> : <Pattern />}
                </motion.div>
              </AnimatePresence>
            </main>
            <footer className="footer">
              <span>Ember is a planning aid, not medical advice.</span>
              <span className="footer-dot" aria-hidden>·</span>
              <span>Your data stays on this device.</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </MotionConfig>
  )
}
