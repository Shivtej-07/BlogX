import { useState, useEffect, createContext, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import './App.css'
import authService from "./appwrite/auth"
import { login, logout } from "./store/authSlice"
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { Toaster, toast } from 'react-hot-toast'

// Create Theme Context
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

function App() {
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("blogx_theme") || "dark";
  });
  const dispatch = useDispatch()

  useEffect(() => {
    // Initial theme setup
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("blogx_theme", nextTheme);
      toast.success(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, {
        style: {
          background: nextTheme === 'dark' ? '#1e293b' : '#ffffff',
          color: nextTheme === 'dark' ? '#f8fafc' : '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }
      });
      return nextTheme;
    });
  };

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }))
        } else {
          dispatch(logout())
        }
      })
      .catch(() => {
        dispatch(logout())
      })
      .finally(() => {
        setLoading(false)
        // Show a brief greeting toast if logged in or mock mode notification
        if (authService.useMock) {
          toast("Running in Mock Mode (offline/unconfigured)", {
            icon: '⚡',
            style: {
              background: '#ef4444',
              color: '#ffffff',
            },
            duration: 4000
          });
        }
      })
  }, [dispatch])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            borderRadius: '12px',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
      {!loading ? (
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] relative z-10 transition-colors duration-300">
          {/* Decorative Background Blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none z-[-1] animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/5 to-purple-500/10 rounded-full blur-[120px] pointer-events-none z-[-1] animate-blob delay-300"></div>

          <Header />
          <main className="flex-grow flex flex-col pt-16">
            <Outlet />
          </main>
          <Footer />
        </div>
      ) : (
        <div className="min-h-screen w-full bg-[#0f172a] flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-md p-6 glass-card border border-white/5 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-t-2 border-indigo-500 border-r-2 border-purple-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-indigo-400">B</div>
            </div>
            <div className="h-4 w-40 skeleton mb-4"></div>
            <div className="h-3 w-60 skeleton mb-2"></div>
            <div className="h-3 w-48 skeleton opacity-50"></div>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  )
}

export default App
