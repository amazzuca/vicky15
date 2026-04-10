import React, { useState, useEffect, useRef } from 'react';
import { Camera, LogOut, Upload as UploadIcon, X } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function PhotoWall({ user, onLogout }) {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Muro en tiempo real
  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const photosArray = [];
      querySnapshot.forEach((doc) => {
        photosArray.push({ id: doc.id, ...doc.data() });
      });
      setPhotos(photosArray);
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Subir a Cloudinary (manteniendo la barra de progreso)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'xv_fotos'); // Tu upload preset

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dx65keh25/image/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const downloadURL = data.secure_url;

          // 2. Guardar en Firestore la URL y datos del usuario
          await addDoc(collection(db, "photos"), {
            url: downloadURL,
            userId: user.uid,
            userName: user.displayName || 'Invitado',
            userPhoto: user.photoURL || null,
            createdAt: serverTimestamp()
          });

          setIsUploading(false);
          setUploadProgress(0);
        } else {
          console.error("Error de Cloudinary:", xhr.responseText);
          alert("Error al subir la foto.");
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        console.error("Error de red.");
        alert("Error de red al subir la foto.");
        setIsUploading(false);
      };

      xhr.send(formData);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <header className="glass-panel" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderRadius: '0 0 16px 16px',
        borderTop: 'none'
      }}>
        <h2 className="text-gold text-glow" style={{ fontSize: '1.5rem', margin: 0 }}>Mis XV</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="Avatar" style={{ width: 30, height: 30, borderRadius: '50%' }} />
          )}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {window.innerWidth > 480 ? `Hola, ${user.displayName?.split(' ')[0]}` : ''}
          </span>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Progress Bar (si está subiendo) */}
      {isUploading && (
        <div className="container" style={{ marginBottom: '20px' }}>
          <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px', color: 'var(--gold-primary)' }}>Subiendo foto... {uploadProgress}%</p>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--gold-primary)', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Masonry Grid */}
      <div className="container" style={{
        display: 'columns',
        columnCount: window.innerWidth > 768 ? 3 : 2,
        columnGap: '15px'
      }}>
        {photos.length === 0 && !isUploading && (
          <div style={{ columnSpan: 'all', textAlign: 'center', paddingTop: '50px', color: 'var(--text-secondary)' }}>
            <Camera size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>Aún no hay fotos. ¡Sé el primero en subir una!</p>
          </div>
        )}
        
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="glass-panel animate-fade-in" 
            style={{ 
              marginBottom: '15px', 
              breakInside: 'avoid', 
              overflow: 'hidden',
              padding: '6px',
              paddingBottom: '12px'
            }}
          >
            <img 
              src={photo.url} 
              alt="Party momento" 
              style={{ width: '100%', display: 'block', borderRadius: '10px', marginBottom: '8px' }} 
              loading="lazy"
            />
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {photo.userPhoto ? (
                <img src={photo.userPhoto} alt={photo.userName} style={{ width: 20, height: 20, borderRadius: '50%', marginRight: '8px' }} />
              ) : null}
              <span><strong className="text-gold">{photo.userName}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Input de archivo invisible */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // Sugiere abrir la cámara en celulares
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileSelect}
      />

      {/* Upload FAB */}
      <button 
        className="fab" 
        onClick={() => fileInputRef.current?.click()} 
        aria-label="Subir foto"
        disabled={isUploading}
        style={{ opacity: isUploading ? 0.5 : 1 }}
      >
        {isUploading ? <UploadIcon size={24} /> : <Camera size={28} />}
      </button>
    </div>
  );
}
