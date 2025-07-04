import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom'
import { FlagProvider } from '@unleash/proxy-client-react'
import { unleashConfig } from './config/unleash'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <FlagProvider config={unleashConfig}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </FlagProvider>
    </React.StrictMode>,
)
