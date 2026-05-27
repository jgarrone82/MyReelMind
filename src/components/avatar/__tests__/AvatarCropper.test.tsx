import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock react-easy-crop - simulate crop completion with state
let onCropCompleteCallback: ((croppedArea: { width: number; height: number }, pixelCrop: { x: number; y: number; width: number; height: number }) => void) | null = null;

vi.mock("react-easy-crop", () => ({
  default: ({
    onCropComplete,
  }: {
    image: string;
    onCropComplete: (croppedArea: { width: number; height: number }, pixelCrop: { x: number; y: number; width: number; height: number }) => void;
    cropShape?: "round" | "rect";
  }) => {
    onCropCompleteCallback = onCropComplete;
    return null;
  },
}));

// Mock canvas.toBlob - callback is the FIRST argument
HTMLCanvasElement.prototype.toBlob = vi.fn((callback, _type, _quality) => {
  if (callback) {
    act(() => {
      callback(new Blob(["cropped-image-data"], { type: "image/jpeg" }));
    });
  }
});

// Mock getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
})) as unknown as HTMLCanvasElement["getContext"];

// Mock Image constructor
class MockImage {
  crossOrigin: string = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = "";
  constructor() {
    // Trigger onload asynchronously
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}
vi.stubGlobal("Image", MockImage);

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockRevokeObjectURL = vi.fn();
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: mockRevokeObjectURL,
});

import { AvatarCropper } from "../AvatarCropper";

describe("AvatarCropper", () => {
  const originalImageSrc = "blob:original-image";

  beforeEach(() => {
    vi.clearAllMocks();
    onCropCompleteCallback = null;
  });

  it("should render modal with crop controls when open", () => {
    const onCropComplete = vi.fn();
    const onCancel = vi.fn();

    render(
      <AvatarCropper
        open={true}
        imageSrc={originalImageSrc}
        onCropComplete={onCropComplete}
        onCancel={onCancel}
        dict={{
          cropAvatar: "Crop Avatar",
          cancel: "Cancel",
          confirm: "Confirm",
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("should call onCropComplete with Blob when Confirm is clicked after crop area set", async () => {
    const onCropComplete = vi.fn();
    const onCancel = vi.fn();

    render(
      <AvatarCropper
        open={true}
        imageSrc={originalImageSrc}
        onCropComplete={onCropComplete}
        onCancel={onCancel}
        dict={{
          cropAvatar: "Crop Avatar",
          cancel: "Cancel",
          confirm: "Confirm",
        }}
      />
    );

    // Simulate react-easy-crop calling onCropComplete with a cropped area - wrapped in act
    await act(async () => {
      if (onCropCompleteCallback) {
        onCropCompleteCallback(
          { width: 100, height: 100 },
          { x: 0, y: 0, width: 100, height: 100 }
        );
      }
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    });

    // Wait for async image loading + toBlob callback
    await waitFor(
      () => {
        expect(onCropComplete).toHaveBeenCalled();
        const blobArg = onCropComplete.mock.calls[0][0];
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe("image/jpeg");
      },
      { timeout: 3000 }
    );
  });

  it("should call onCancel and revoke URL when Cancel is clicked", async () => {
    const onCropComplete = vi.fn();
    const onCancel = vi.fn();

    render(
      <AvatarCropper
        open={true}
        imageSrc={originalImageSrc}
        onCropComplete={onCropComplete}
        onCancel={onCancel}
        dict={{
          cropAvatar: "Crop Avatar",
          cancel: "Cancel",
          confirm: "Confirm",
        }}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Cancel should revoke the original imageSrc URL
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(originalImageSrc);
    expect(onCancel).toHaveBeenCalled();
    expect(onCropComplete).not.toHaveBeenCalled();
  });
});