/* ==========================================================
   PERSONALIZA TU INVITACIÓN AQUÍ.
   Los textos que YA ESTÁN DENTRO de las imágenes del video
   no pueden cambiarse mediante estas variables. Este archivo
   controla los datos y las funciones de la página web.
   ========================================================== */
window.INVITACION = {
  nombre: 'Madison',               // Ejemplo del video: reemplázalo por el nombre real
  edad: 3,
  fecha: '2026-12-05',            // AAAA-MM-DD
  hora: '17:00',                  // 24 horas, por ejemplo 17:00 = 5 PM
  lugar: 'Casa de mi tía',
  direccion: 'Naranjito, Agua Fría',
  mapaURL: '',                    // Pega aquí el link de Google Maps (recomendado)
  whatsapp: '',                  // Por ejemplo: 5217221234567 (sin + ni espacios)
  mensajeRSVP: '¡Hola! Confirmo mi asistencia al cumpleaños de 3 años de {nombre}.',
  vestimenta: 'Trae tu atuendo victoriano',
  regaloNota: 'El mejor regalo será compartir este día contigo.',
  regalos: [
    'Tu regalo será muy especial',
    'Ayuda a la cumpleañera a crear su propia granja',
    'Lluvia de sobres'
  ],
  // Si deseas cubrir la foto del marco pequeño en la portada,
  // coloca una imagen en fotos/portada.jpg y activa fotoPortada.
  // Nota: el resultado será aproximado; el marco y la foto original
  // están unidos en la imagen de referencia.
  fotoPortada: '',               // 'fotos/portada.jpg'
  // Agrega las fotos que quieras mostrar en una galería EXTRA,
  // sin modificar ni reemplazar las seis imágenes originales.
  fotos: [
    // 'fotos/1.jpg',
    // 'fotos/2.jpg',
    // 'fotos/3.jpg',
  ],
  // Opcional: si tienes un MP3 con licencia, escribe la ruta aquí.
  // Cuando está vacío, el botón reproduce una melodía breve original
  // creada con sonido sintetizado, sin descargar archivos de audio.
  musicaArchivo: ''
};
