/// <reference types="vite-plugin-pwa/client" />

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

createRoot(document.getElementById("root")!).render(<App />);

registerSW({ immediate: true })
