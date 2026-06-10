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
      {/*
        VHS theming is applied ONLY via call-site className/props passed to the
        shared shadcn Dialog/Button primitives (issue #51, R7/R27). The shared
        components under src/components/ui are never edited. twMerge resolves the
        primitive's default bg/text/ring/radius in favor of these VHS overrides;
        the built-in close (X) button stays as-is — a contained-but-functional
        modal is accepted rather than touching the shared primitive (D4).
      */}
      <DialogContent className="rounded-[2px] border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-2)] text-[var(--vhs-cream)] ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="vhs-kicker text-[var(--vhs-cream)]">
            {dict.cropAvatar}
          </DialogTitle>
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
            <label
              htmlFor="zoom-slider"
              className="vhs-kicker text-[0.72rem] tracking-[0.14em] text-[var(--vhs-cream-dim)]"
            >
              Zoom
            </label>
            <input
              id="zoom-slider"
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--vhs-magenta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
            />
          </div>
        </div>

        <DialogFooter className="rounded-b-[2px] border-t-2 border-[var(--vhs-ground-3)] bg-transparent">
          <Button variant="outline" onClick={handleCancel} className="vhs-btn vhs-btn--secondary h-auto focus-visible:ring-0">
            {dict.cancel}
          </Button>
          <Button onClick={handleConfirm} className="vhs-btn h-auto focus-visible:ring-0">
            {dict.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}