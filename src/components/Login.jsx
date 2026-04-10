import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../services/firebase';

export default function Login() {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Ingresado con Google:', result.user.displayName);
    } catch (err) {
      console.error(err);
      setError('Error al ingresar con Google. Intenta nuevamente.');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log('Ingresado con Facebook:', result.user.displayName);
    } catch (err) {
      console.error(err);
      setError('Error al ingresar con Facebook. Intenta nuevamente.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <h1 className="text-gold text-glow" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          Mis XV Años
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
          ¡Bienvenida/o! Inicia sesión para compartir tus mejores momentos de la fiesta.
        </p>

        {error && <p style={{ color: '#ff6b6b', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</p>}

        <button className="btn-gold" onClick={handleGoogleLogin} style={{ width: '100%' }}>
          <LogIn size={20} />
          <span>Ingresar con Google</span>
        </button>
        
        <button 
          className="btn-gold" 
          onClick={handleFacebookLogin} 
          style={{ 
            width: '100%', 
            marginTop: '15px', 
            background: 'rgba(59, 89, 152, 0.2)', 
            color: 'white', 
            border: '1px solid rgba(59, 89, 152, 0.5)' 
          }}
        >
          <LogIn size={20} />
          <span>Ingresar con Facebook</span>
        </button>
      </div>
    </div>
  );
}
