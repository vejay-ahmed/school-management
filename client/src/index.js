import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/components.css';
import './styles/cards.css';
import './styles/forms.css';
import './styles/tables.css';
import './styles/auth.css';
import './styles/modal.css';
import './styles/utilities.css';
import './styles/responsive.css';
import './styles/public.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
