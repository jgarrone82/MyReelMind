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

  it("should theme the modal via call-site classes only (VHS ground panel, kicker title, VHS footer buttons)", () => {
    render(
      <AvatarCropper
        open={true}
        imageSrc={originalImageSrc}
        onCropComplete={vi.fn()}
        onCancel={vi.fn()}
        dict={{
          cropAvatar: "Crop Avatar",
          cancel: "Cancel",
          confirm: "Confirm",
        }}
      />
    );

    // Dialog panel gets the VHS ground treatment via call-site className (R27/S14)
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).not.toBeNull();
    expect(content?.className).toMatch(/bg-\[var\(--vhs-ground-2\)\]/);
    expect(content?.className).toMatch(/border-\[var\(--vhs-ground-3\)\]/);

    // Title uses the VHS kicker treatment
    const title = document.querySelector('[data-slot="dialog-title"]');
    expect(title?.className).toMatch(/vhs-kicker/);

    // Footer cancel button uses the VHS secondary treatment; confirm uses .vhs-btn (R3 deep-ink on magenta)
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(cancel).toHaveClass("vhs-btn", "vhs-btn--secondary");
    expect(confirm).toHaveClass("vhs-btn");
    expect(confirm.className).not.toMatch(/vhs-btn--secondary/);

    // Both footer buttons release the primitive's h-8 clamp so .vhs-btn vertical
    // rhythm is restored, and suppress the primitive's ring box-shadow so only the
    // .vhs-btn:focus-visible phosphor outline shows (no double focus indicator).
    expect(cancel).toHaveClass("h-auto", "focus-visible:ring-0");
    expect(confirm).toHaveClass("h-auto", "focus-visible:ring-0");

    // Zoom range input carries the shared R4 phosphor focus ring
    const zoomInput = screen.getByLabelText("Zoom");
    expect(zoomInput.className).toMatch(/focus-visible:ring-\[var\(--vhs-phosphor\)\]/);
    expect(zoomInput.className).toMatch(/focus-visible:ring-2/);
    expect(zoomInput.className).toMatch(/focus-visible:ring-offset-\[var\(--vhs-ground\)\]/);

    // Footer radius is clamped to the 2px panel radius (no rounded-b-xl poke-out)
    const footer = document.querySelector('[data-slot="dialog-footer"]');
    expect(footer?.className).toMatch(/rounded-b-\[2px\]/);

    // Zoom label must drop the shadcn text-muted-foreground token (R5)
    const zoomLabel = screen.getByText("Zoom");
    expect(zoomLabel.className).not.toMatch(/text-muted-foreground/);
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