// ==========================================================
// FICHIER : src/components/activities/ImageCropperA4.tsx
// Composant réutilisable pour recadrage d'image au format A4 (ratio 1:1.414).
// Utilise react-easy-crop pour permettre à l'utilisateur de zoomer/déplacer son image.
// Props : imageSrc (string, chemin/base64), onCropComplete (callback base64)
// ==========================================================

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

/**
 * Props du composant de crop d'image A4
 * @property imageSrc - Lien ou base64 de l’image à éditer
 * @property onCropComplete - Callback avec le base64 du crop validé
 */
interface ImageCropperA4Props {
  imageSrc: string
  onCropComplete: (croppedImage: string) => void
}

function ImageCropperA4({ imageSrc, onCropComplete }: ImageCropperA4Props) {

  // === 1. state (état, données) ===

  const [crop, setCrop] = useState({ x: 0, y: 0 }) // Position du crop
  const [zoom, setZoom] = useState(1)              // Zoom de l’image
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null) // Zone cropée (pixels)
  const [showCrop, setShowCrop] = useState(true)   // Affichage du cropper

  // === 2. comportements (handlers, callbacks, logique) ===

  const onCropChange = (c: any) => setCrop(c)
  const onZoomChange = (z: number) => setZoom(z)

  const onCropAreaComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropValidate = async () => {
    if (!croppedAreaPixels) return
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
    onCropComplete(croppedImage as string)
    setShowCrop(false)
  }

  /**
   * Génère une image croppée au format base64 JPEG
   * @param imageSrc - Lien ou base64 de l’image source
   * @param crop - Objet crop { x, y, width, height }
   * @returns base64 JPEG croppé ou null
   */
  async function getCroppedImg(imageSrc: string, crop: any): Promise<string | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(
      image,
      crop.x, crop.y, crop.width, crop.height, // source
      0, 0, crop.width, crop.height            // destination
    )
    return canvas.toDataURL('image/jpeg')
  }

  /**
   * Crée un élément image HTML chargé depuis une URL ou base64
   * @param url - URL de l’image ou base64
   * @returns HTMLImageElement chargé
   */
  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new window.Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous') // pour CORS
      image.src = url
    })
  }

  // === 3. affichage (render) ===

  if (!showCrop) return null

  return (
    <div className="relative w-full h-[400px] bg-black">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        minZoom={0.5}
        maxZoom={3}
        aspect={1 / 1.414}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={onCropAreaComplete}
        cropShape="rect"
        showGrid={false}
      />
      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center z-10">
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-2/3"
          aria-label="Zoom de l'image"
        />
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded shadow"
          onClick={handleCropValidate}
        >
          Valider le cadrage
        </button>
      </div>
    </div>
  )
}

export default ImageCropperA4
