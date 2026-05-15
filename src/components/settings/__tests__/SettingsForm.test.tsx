import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock uploadAvatar
const mockUploadAvatar = vi.fn();
vi.mock("@/lib/supabase/storage", () => ({
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
}));

// Mock updateProfile action
vi.mock("@/actions/settings", () => ({
  updateProfile: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock AvatarCropper - render a simple component that triggers the onCropComplete callback
let mockOnCropComplete: ((blob: Blob) => void) | null = null;
let mockOnCancel: (() => void) | null = null;

vi.mock("@/components/avatar/AvatarCropper", () => ({
  AvatarCropper: ({
    onCropComplete,
    onCancel,
  }: {
    imageSrc: string;
    onCropComplete: (blob: Blob) => void;
    onCancel: () => void;
    dict: { cropAvatar: string; cancel: string; confirm: string };
  }) => {
    mockOnCropComplete = onCropComplete;
    mockOnCancel = onCancel;
    return (
      <div data-testid="avatar-cropper">
        <button type="button" data-testid="crop-confirm" onClick={() => onCropComplete(new Blob(["cropped"], { type: "image/jpeg" }))}>
          CropConfirm
        </button>
        <button type="button" data-testid="crop-cancel" onClick={onCancel}>
          CropCancel
        </button>
      </div>
    );
  },
}));

// Mock URL - extend native URL to preserve next/image compatibility
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn(() => "blob:mock-preview");

// Preserve native URL constructor for next/image and other internals
class MockURL extends URL {
  static createObjectURL = mockCreateObjectURL;
  static revokeObjectURL = mockRevokeObjectURL;
}

vi.stubGlobal("URL", MockURL);

// Mock Image
class MockImage {
  src = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
}
vi.stubGlobal("Image", MockImage);

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

import { SettingsForm } from "../SettingsForm";

describe("SettingsForm - Avatar Upload", () => {
  const mockDict = {
    settings: {
      title: "Settings",
      displayName: "Display Name",
      avatarUrl: "Avatar URL",
      privacy: "Privacy",
      publicProfile: "Make my profile public",
      save: "Save Changes",
      saved: "Settings saved",
      errorNameRequired: "Display name is required",
      errorNameLength: "Display name must be 50 characters or less",
      errorInvalidUrl: "Invalid avatar URL",
      errorUnauthorized: "You must be signed in",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
      avatarUpload: "Upload Avatar",
      avatarCrop: "Crop Avatar",
      avatarCancel: "Cancel",
      avatarConfirm: "Confirm",
      avatarFileSize: "File too large (max 2MB)",
      avatarFileType: "Invalid file type",
      avatarUploadError: "Upload failed",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      error: "Error",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnCropComplete = null;
    mockOnCancel = null;
  });

  it("should render avatar file input field", () => {
    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    const input = screen.getByLabelText(/avatar/i);
    expect(input).toHaveAttribute("type", "file");
  });

  it("should show error for invalid file type", async () => {
    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    const input = screen.getByLabelText(/avatar/i);
    const file = new File(["test"], "document.pdf", { type: "application/pdf" });

    await act(async () => {
      userEvent.upload(input, file);
    });

    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
  });

  it("should show error for file exceeding 2MB", async () => {
    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    const input = screen.getByLabelText(/avatar/i);
    // Create a mock file > 2MB by passing a large ArrayBuffer
    const buffer = new ArrayBuffer(3 * 1024 * 1024); // 3MB
    const file = new File([buffer], "large-avatar.jpg", { type: "image/jpeg" });

    await act(async () => {
      userEvent.upload(input, file);
    });

    expect(screen.getByText(/file too large/i)).toBeInTheDocument();
  });

  it("should open AvatarCropper when valid file is selected", async () => {
    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    const input = screen.getByLabelText(/avatar/i);
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });

    await act(async () => {
      userEvent.upload(input, file);
    });

    await waitFor(() => {
      expect(screen.getByTestId("avatar-cropper")).toBeInTheDocument();
    });
  });

  it("should call uploadAvatar when crop is confirmed", async () => {
    mockUploadAvatar.mockResolvedValue({
      url: "https://example.supabase.co/storage/v1/object/public/avatars/user/123.jpg",
      error: null,
    });

    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    // Select a valid file to open cropper
    const input = screen.getByLabelText(/avatar/i);
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });

    await act(async () => {
      userEvent.upload(input, file);
    });

    await waitFor(() => {
      expect(screen.getByTestId("avatar-cropper")).toBeInTheDocument();
    });

    // Click confirm to trigger crop and upload
    await act(async () => {
      userEvent.click(screen.getByTestId("crop-confirm"));
    });

    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalled();
    });
  });

  it("should show upload error when uploadAvatar fails", async () => {
    mockUploadAvatar.mockResolvedValue({
      url: null,
      error: "Upload failed",
    });

    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    // Select a valid file
    const input = screen.getByLabelText(/avatar/i);
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });

    await act(async () => {
      userEvent.upload(input, file);
    });

    await waitFor(() => {
      expect(screen.getByTestId("avatar-cropper")).toBeInTheDocument();
    });

    // Confirm crop
    await act(async () => {
      userEvent.click(screen.getByTestId("crop-confirm"));
    });

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  it("should cancel crop and revoke URL", async () => {
    render(
      <SettingsForm
        dict={mockDict as any}
        initialValues={{
          displayName: "John",
          avatarUrl: null,
          isPublic: true,
        }}
      />
    );

    // Select a valid file
    const input = screen.getByLabelText(/avatar/i);
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });

    await act(async () => {
      userEvent.upload(input, file);
    });

    await waitFor(() => {
      expect(screen.getByTestId("avatar-cropper")).toBeInTheDocument();
    });

    // Cancel crop
    await act(async () => {
      userEvent.click(screen.getByTestId("crop-cancel"));
    });

    expect(mockRevokeObjectURL).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByTestId("avatar-cropper")).not.toBeInTheDocument();
    });
  });
});