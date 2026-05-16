"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AvatarCropperProps {
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
  onCancel: () => void;
  open: boolean;
  dict: {
    cropAvatar: string;
    cancel: string;
    confirm: string;
  };
}

export function AvatarCropper({ imageSrc, onCropComplete, onCancel, open, dict }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.cropAvatar}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
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

          <div className="flex w-full flex-col gap-1">
            <label htmlFor="zoom-slider" className="text-sm text-muted-foreground">Zoom</label>
            <input
              id="zoom-slider"
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {dict.cancel}
          </Button>
          <Button onClick={handleConfirm}>
            {dict.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}