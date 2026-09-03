import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { AuthProvider } from './context/AuthContext';
import { apolloClient } from './utils/api';
import App from './App';
import './styles/globals.css';

const root = document.getElementById('root');
if (root === null) {
  throw new Error('Root element #root is missing');
}

createRoot(root).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
