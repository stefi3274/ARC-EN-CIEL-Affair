// Compresse une image dans le navigateur avant l'envoi vers Supabase Storage :
// redimensionne au maximum indique et recompresse en JPEG a une qualite qui
// garde un bon rendu visuel tout en reduisant nettement la taille du fichier.
export function compressImage(file: File, maxDimension = 1440, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressed = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
