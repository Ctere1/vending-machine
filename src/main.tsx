import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const VendingMachineExperience = lazy(() => import('./VendingMachineExperience'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="loading">Replenishing the machine ...</div>}>
      <VendingMachineExperience />
    </Suspense>
  </React.StrictMode>,
)
