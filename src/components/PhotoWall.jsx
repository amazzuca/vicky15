import React, { useState, useEffect, useRef } from 'react';
import { Camera, LogOut, Upload as UploadIcon, Trash2 } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const ADMIN_EMAIL = 'alejandro.mazzuca@gmail.com';

export default function PhotoWall({ user, onLogout }) {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

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

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm("¿Estás seguro que deseas eliminar esta foto permanentemente?")) {
      try {
        await deleteDoc(doc(db, "photos", photoId));
      } catch (error) {
        console.error("Error eliminando foto: ", error);
        alert("Error al intentar eliminar la foto");
      }
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'xv_fotos'); 

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
      <header className="glass-panel" style={{ 
        position: 'sticky', top: 0, zIndex: 50, padding: '15px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', borderRadius: '0 0 16px 16px', borderTop: 'none'
      }}>
        <h2 className="text-gold text-glow" style={{ fontSize: '1.5rem', margin: 0 }}>Mis XV</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAdmin && <span style={{color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold'}}>Admin</span>}
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

      <div className="container" style={{
        display: 'columns', columnCount: window.innerWidth > 768 ? 3 : 2, columnGap: '15px'
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
              marginBottom: '15px', breakInside: 'avoid', overflow: 'hidden', padding: '6px', paddingBottom: '12px', position: 'relative'
            }}
          >
            {/* Botón Administrador de borrado superpuesto */}
            {isAdmin && (
              <button 
                onClick={() => handleDeletePhoto(photo.id)}
                style={{
                  position: 'absolute', top: '15px', right: '15px',
                  background: 'rgba(220, 53, 69, 0.85)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '35px', height: '35px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
                }}
                title="Eliminar foto"
              >
                <Trash2 size={16} />
              </button>
            )}

            <img 
              src={photo.url} alt="Party momento" 
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

      <input 
        type="file" accept="image/*" capture="environment" 
        ref={fileInputRef} style={{ display: 'none' }} 
        onChange={handleFileSelect}
      />

      <button 
        className="fab" onClick={() => fileInputRef.current?.click()} 
        aria-label="Subir foto" disabled={isUploading} style={{ opacity: isUploading ? 0.5 : 1 }}
      >
        {isUploading ? <UploadIcon size={24} /> : <Camera size={28} />}
      </button>
    </div>
  );
}
