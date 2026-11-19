'use client';

import { useEffect, useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import { useDropzone } from 'react-dropzone';
import { LuCloudUpload, LuFile, LuFileText, LuPlus, LuX } from 'react-icons/lu';
import { faNum } from '@/app/util';

interface SelectedFile {
  file: File;
  preview: string | null;
}

export default function PersonalDocuments() {
  const [files, setFiles] = useState<SelectedFile[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
    }));

    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
    maxFiles: 5 - files.length,
    onDrop,
    disabled: files.length >= 5,
    noClick: false,
  });

  useEffect(() => {
    return () => {
      files.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [files]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const removedFile = prev[index];

      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const formatSize = (size: number) => {
    return size < 1024 * 1024
      ? `${faNum((size / 1024).toFixed(1))} KB`
      : `${faNum((size / (1024 * 1024)).toFixed(1))} MB`;
  };

  return (
    <div className="w-full min-w-0 rounded-2xl border border-border p-3 sm:p-4 md:p-6">
      <div className="mb-4 flex items-center justify-start gap-3 border-b border-border pb-3 sm:gap-4 sm:pb-4">
        <IoPerson className="shrink-0 fill-action-primary" size={40} />
        <h2 className="text-xl font-black sm:text-2xl">مدارک شخص</h2>
      </div>

      {/* Input Upload */}
      <div className="min-w-0">
        <div
          {...getRootProps()}
          className={`
          min-h-52 sm:min-h-62.5
          flex flex-col justify-center
          rounded-2xl border border-dashed border-border
          bg-action-primary/10
          p-4 text-center
          transition duration-300
          sm:p-6 md:p-8
          ${
            files.length >= 5
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:border-action-primary hover:bg-action-primary/15'
          }
          ${isDragActive ? 'border-action-primary bg-action-primary/20' : ''}
        `}
        >
          <input {...getInputProps()} />

          {files.length === 0 ? (
            <div className="flex flex-col items-center gap-3">
              <LuCloudUpload
                size={40}
                className="text-action-primary sm:size-12"
              />

              <p className="text-sm font-semibold sm:text-base">
                {isDragActive
                  ? 'فایل‌ها را اینجا رها کنید'
                  : 'فایل‌های خود را اینجا رها کنید یا کلیک کنید'}
              </p>

              <span className="text-xs text-muted-foreground sm:text-sm">
                فرمت‌های مجاز: PDF و تصاویر
              </span>

              <span className="text-xs text-muted-foreground">
                {faNum(files.length)} از {faNum(5)} فایل انتخاب شده
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5">
              {files.map(({ file, preview }, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="group relative min-w-0"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    className="
                    absolute -right-2 -top-2 z-10
                    flex h-7 w-7 items-center justify-center
                    rounded-full bg-background
                    text-muted-foreground shadow-md
                    cursor-pointer
                    transition-colors duration-200
                    hover:text-action-error
                  "
                    aria-label={`حذف ${file.name}`}
                  >
                    <LuX size={15} />
                  </button>

                  {/* File Preview */}
                  <div className="mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-action-primary/10 sm:mb-3">
                    {preview ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : file.type === 'application/pdf' ? (
                      <LuFileText
                        size={40}
                        className="text-action-primary sm:size-12"
                      />
                    ) : (
                      <LuFile
                        size={40}
                        className="text-action-primary sm:size-12"
                      />
                    )}
                  </div>

                  {/* File Name */}
                  <p
                    className="truncate text-xs font-semibold sm:text-sm"
                    title={file.name}
                  >
                    {file.name}
                  </p>

                  {/* File Size */}
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                    {formatSize(file.size)}
                  </p>
                </div>
              ))}

              {/* Add More Files */}
              {files.length < 5 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    open();
                  }}
                  className="
                  flex min-h-24 cursor-pointer
                  items-center justify-center
                  text-action-primary transition
                  sm:min-h-32
                "
                >
                  <LuPlus className="h-11 w-11 rounded-2xl bg-action-primary/5 p-2.5 transition duration-300 hover:bg-action-primary/10 sm:h-14 sm:w-14 sm:p-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* File Counter */}
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-[10px] text-muted-foreground sm:text-xs">
          <span>فرمت‌های مجاز: PDF و تصاویر</span>
          <span>
            {faNum(files.length)} از {faNum(5)} فایل
          </span>
        </div>

        {/* Upload Button */}
        <div className="mt-4 sm:mt-6">
          <button
            type="button"
            disabled={files.length === 0}
            onClick={() => {
              // Upload files
              console.log(files.map(({ file }) => file));
            }}
            className={`
              w-full rounded-xl px-6 py-3
              text-sm font-semibold sm:px-8 sm:text-base
              transition-all duration-300
              ${
                files.length === 0
                  ? 'cursor-not-allowed bg-foreground/5 bg-muted text-foreground-muted opacity-50'
                  : 'cursor-pointer bg-action-primary text-white hover:opacity-90'
              }
            `}
          >
            بارگذاری
          </button>
        </div>
      </div>
    </div>
  );
}
