"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Modal } from "@/components/molecules";
import { Button } from "@/components/atoms";
import { virtualTryOn } from "@/lib/services/vton";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface VTonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  garmentImage?: string;
  garmentName?: string;
  onAddToCart?: () => void;
}

export const VTonDialog = ({
  isOpen,
  onClose,
  garmentImage: externalGarmentImage,
  garmentName,
  onAddToCart,
}: VTonDialogProps) => {
  const t = useTranslations("vton");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // When external garmentImage is provided, use it as preview
  useEffect(() => {
    if (externalGarmentImage) {
      setGarmentPreview(externalGarmentImage);
      setGarmentFile(null); // Will convert URL to File when needed
    }
  }, [externalGarmentImage]);

  const handlePersonChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    },
    []
  );

  const handleGarmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setGarmentFile(file);
      setGarmentPreview(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    },
    []
  );

  const handleTryOn = useCallback(async () => {
    if (!personFile) return;

    const activeGarmentFile = garmentFile || externalGarmentImage;
    if (!activeGarmentFile) return;

    setIsLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      let garmentToSend: File;
      if (garmentFile) {
        garmentToSend = garmentFile;
      } else {
        garmentToSend = await urlToFile(
          externalGarmentImage!,
          "garment.jpg",
          "image/jpeg"
        );
      }

      const result = await virtualTryOn(personFile, garmentToSend);

      if (result.success && result.resultUrl) {
        setResultUrl(result.resultUrl);
      } else {
        setError(result.error || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  }, [personFile, garmentFile, externalGarmentImage, t]);

  const handleClose = useCallback(() => {
    setPersonFile(null);
    setPersonPreview(null);
    setGarmentFile(null);
    setGarmentPreview(null);
    setResultUrl(null);
    setError(null);
    setIsLoading(false);
    if (personInputRef.current) {
      personInputRef.current.value = "";
    }
    if (garmentInputRef.current) {
      garmentInputRef.current.value = "";
    }
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const canTryOn = !!personFile && (!!garmentFile || !!externalGarmentImage);

  return (
    <Modal heading={t("title")} onClose={handleClose} data-testid="vton-dialog">
      <div className="p-6 space-y-6">
        {/* Garment - either from external or upload */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {t("garment")}
          </p>

          {/* Show external garment image if provided */}
          {externalGarmentImage && (
            <div className="relative w-40 h-40 mx-auto border rounded-lg overflow-hidden bg-gray-50 mb-3">
              <Image
                src={externalGarmentImage}
                alt={garmentName || t("garment")}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Garment Upload */}
          {!externalGarmentImage && (
            <input
              ref={garmentInputRef}
              type="file"
              accept="image/*"
              onChange={handleGarmentChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              data-testid="vton-garment-upload"
            />
          )}

          {garmentPreview && !externalGarmentImage && (
            <div className="mt-3 relative w-40 h-40 mx-auto border rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={garmentPreview}
                alt={t("garment")}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Person Photo Upload */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {t("uploadPerson")}
          </p>
          <input
            ref={personInputRef}
            type="file"
            accept="image/*"
            onChange={handlePersonChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            data-testid="vton-person-upload"
          />
          {personPreview && (
            <div className="mt-3 relative w-40 h-40 mx-auto border rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={personPreview}
                alt={t("yourPhoto")}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Try On Button */}
        <Button
          onClick={handleTryOn}
          disabled={!canTryOn || isLoading}
          loading={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          data-testid="vton-try-button"
        >
          {!isLoading && t("tryOn")}
        </Button>

        {/* Error */}
        {error && (
          <div
            className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
            data-testid="vton-error"
          >
            {error}
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">{t("result")}</p>
            <div className="relative w-full max-w-sm mx-auto aspect-[3/4] border rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={resultUrl}
                alt={t("result")}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            {onAddToCart && (
              <Button
                onClick={() => {
                  onAddToCart();
                  handleClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                data-testid="vton-add-to-cart"
              >
                {t("addToCart")}
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <div className="w-8 h-8 border-2 border-orange-500 border-b-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm">{t("loading")}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

async function urlToFile(
  url: string,
  filename: string,
  mimeType: string
): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}
