import { create } from 'zustand'
import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || ''

interface VisitState {
  totalVisits: number
  trackVisit: (page: string) => Promise<void>
  fetchStats: () => Promise<void>
}

export const useVisitStore = create<VisitState>((set) => ({
  totalVisits: 0,
  
  trackVisit: async (page) => {
    try {
      const res = await axios.post(`${API_URL}/api/visit`, { page_path: page })
      set({ totalVisits: res.data.totalVisits })
    } catch (error) {
      // Fallback to localStorage for static deployment
      const stored = localStorage.getItem('totalVisits')
      const current = stored ? parseInt(stored) + 1 : 1
      localStorage.setItem('totalVisits', current.toString())
      set({ totalVisits: current })
    }
  },
  
  fetchStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stats`)
      set({ totalVisits: res.data.totalVisits })
    } catch (error) {
      // Fallback to localStorage for static deployment
      const stored = localStorage.getItem('totalVisits')
      set({ totalVisits: stored ? parseInt(stored) : 0 })
    }
  }
}))