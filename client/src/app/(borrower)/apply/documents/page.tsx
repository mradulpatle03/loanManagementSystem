"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function DocumentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type))
      return "Only PDF, JPG, and PNG files are allowed";
    if (f.size > MAX_SIZE) return "File size must be under 5MB";
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      toast.error(err);
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/borrower/upload-salary-slip", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Salary slip uploaded!");
      router.push("/apply/loan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["borrower"]}>
      <div className="bg-[#f6f8fc] py-10 px-4">
        <div className="max-w-lg mx-auto">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back
            </button>

            <span className="text-xs text-gray-400">Step 2 of 3</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Salary Slip
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                This helps us verify your income securely
              </p>
            </div>

            {/* Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border rounded-xl p-8 text-center cursor-pointer transition-all
        ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />

              {file ? (
                <div className="flex items-center gap-3 text-left">
                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 text-xl">
                    {file.type === "application/pdf" ? "📄" : "🖼️"}
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-2xl">
                    ☁️
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop your file
                  </p>
                  <p className="text-xs text-gray-400">
                    or click to browse (PDF, JPG, PNG up to 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Info Strip */}
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
              Your document is encrypted and used only for verification.
            </div>

            {/* Action */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full mt-6 bg-blue-700 hover:bg-blue-800 
        text-white font-medium py-2.5 rounded-lg text-sm 
        transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
