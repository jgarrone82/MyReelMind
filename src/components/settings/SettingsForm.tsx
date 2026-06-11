"use client";

import { useActionState, useState, useRef } from "react";
import { updateProfile } from "@/actions/settings";
import { uploadAvatar } from "@/lib/supabase/storage";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { Dictionary } from "@/i18n/types";
import { useEffect } from "react";
import Image from "next/image";
import { AvatarCropper } from "@/components/avatar/AvatarCropper";

interface SettingsFormProps {
  userId: string;
  dict: Dictionary;
  initialValues: {
    displayName: string;
    avatarUrl: string | null;
    isPublic: boolean;
  };
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function SettingsForm({ userId, dict, initialValues }: SettingsFormProps) {
  const [state, action] = useActionState(updateProfile, undefined);
  const [previewUrl, setPreviewUrl] = useState(initialValues.avatarUrl);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const s = dict.settings;

  // Show toast on success
  useEffect(() => {
    if (state?.success) {
      toast(s.saved);
    }
  }, [state, s.saved]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(s.avatarFileType);
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(s.avatarFileSize);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    // Create object URL for crop preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsCropping(true);
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!selectedFile) return;

    setIsCropping(false);
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadAvatar(userId, blob);

      if (result.error) {
        setUploadError(s.avatarUploadError);
        setIsUploading(false);
        return;
      }

      // Update preview with uploaded URL
      setPreviewUrl(result.url);
    } catch {
      setUploadError(s.avatarUploadError);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(initialValues.avatarUrl);
    setSelectedFile(null);
    setIsCropping(false);
  };

  return (
    <>
      <AvatarCropper
        imageSrc={selectedFile ? URL.createObjectURL(selectedFile) : ""}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
        open={isCropping && !!selectedFile}
        dict={{
          cropAvatar: s.avatarCrop || s.avatarUpload,
          cancel: s.avatarCancel || dict.common.cancel,
          confirm: s.avatarConfirm || dict.common.save,
        }}
      />

      <form action={action} className="space-y-6 max-w-md mx-auto">
        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="vhs-kicker block text-[0.72rem] text-[var(--vhs-cream-dim)]"
          >
            {s.displayName}
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            minLength={1}
            maxLength={50}
            defaultValue={initialValues.displayName}
            className="vhs-input mt-1.5"
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label
            htmlFor="avatarUrl"
            className="vhs-kicker block text-[0.72rem] text-[var(--vhs-cream-dim)]"
          >
            {s.avatarUrl}
          </label>
          <input
            ref={fileInputRef}
            id="avatarUrl"
            name="avatarUrl"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="vhs-mono mt-1.5 block w-full text-sm text-[var(--vhs-cream-dim)] file:mr-4 file:rounded-[2px] file:border-2 file:border-[var(--vhs-ground-3)] file:bg-[var(--vhs-ground-2)] file:px-4 file:py-2 file:text-sm file:font-semibold file:uppercase file:tracking-[0.14em] file:text-[var(--vhs-cream)] hover:file:border-[var(--vhs-phosphor)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
          />
          {/* Avatar preview */}
          <div className="mt-2">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>
          {/* Upload error */}
          {uploadError && (
            <p role="alert" className="vhs-mono mt-1 text-sm text-[var(--vhs-error)]">
              {uploadError}
            </p>
          )}
          {/* Hidden input to submit avatar URL via form */}
          {previewUrl && !previewUrl.startsWith("blob:") && (
            <input type="hidden" name="avatarUrl" value={previewUrl} />
          )}
        </div>

        {/* Public profile toggle */}
        <div>
          <p className="vhs-kicker mb-2 text-[0.72rem] text-[var(--vhs-cream-dim)]">
            {s.privacy}
          </p>
          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              value="true"
              defaultChecked={initialValues.isPublic}
              className="h-4 w-4 rounded-[2px] border-2 border-[var(--vhs-ground-3)] accent-[var(--vhs-magenta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
            />
            <label htmlFor="isPublic" className="vhs-mono text-sm text-[var(--vhs-cream)]">
              {s.publicProfile}
            </label>
          </div>
        </div>

        {/* Error message */}
        {state?.error && (
          <p role="alert" className="vhs-mono text-sm text-[var(--vhs-error)]">
            {errorMessage(state.error, dict)}
          </p>
        )}

        <SubmitButton dict={dict} />
      </form>
    </>
  );
}

function errorMessage(error: string, dict: Dictionary): string {
  const map: Record<string, string> = {
    name_required: dict.settings.errorNameRequired,
    name_too_long: dict.settings.errorNameLength,
    invalid_url: dict.settings.errorInvalidUrl,
    unauthorized: dict.settings.errorUnauthorized,
    avatarUploadError: dict.settings.avatarUploadError || dict.common.error,
  };
  return map[error] ?? dict.common.error;
}

function SubmitButton({ dict }: { dict: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vhs-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? dict.common.loading : dict.settings.save}
    </button>
  );
}