"use client";

import { useState, useRef } from "react";
import Cropper from "react-easy-crop";

interface AvatarCropperProps {
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
  onCancel: () => void;
  dict: {
    cropAvatar: string;
    cancel: string;
    confirm: string;
  };
}

export function AvatarCropper({ imageSrc, onCropComplete, onCancel, dict }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropCompleteHandler = (
    _croppedArea: { width: number; height: number },
    croppedAreaPixels: { x: number; y: number; width: number; height: number }
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedBlob = async (): Promise<Blob | null> => {
    if (!croppedAreaPixels) return null;

    const image = new window.Image();
    image.crossOrigin = "anonymous";

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          size,
          size
        );

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.85
        );
      };
      image.src = imageSrc;
    });
  };

  const handleConfirm = async () => {
    const blob = await getCroppedBlob();
    if (blob) {
      onCropComplete(blob);
    }
  };

  const handleCancel = () => {
    URL.revokeObjectURL(imageSrc);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-w-md flex-col gap-4 rounded-lg bg-primary p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-primary">{dict.cropAvatar}</h2>

        <div className="relative h-64 w-64 overflow-hidden rounded-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            cropShape="round"
            aspect={1}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-secondary">Zoom</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-primary px-4 py-2 text-sm hover:bg-muted"
          >
            {dict.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
          >
            {dict.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}