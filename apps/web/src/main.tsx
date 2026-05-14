import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/providers/providers';

import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppProviders />
    </StrictMode>
);
