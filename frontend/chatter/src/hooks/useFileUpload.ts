import { useState } from 'react';
import api, { apiRequest } from '../services/api';
import { toast } from 'sonner';
import { handleApiError } from '../utils/errorHandler';

interface UploadResult {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface useFileUploadOptions {
  type: 'avatar' | 'message';
  onSuccess: (results: UploadResult[]) => void;
}

export const useFileUpload = ({ type, onSuccess }: useFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    setIsUploading(true);
    try {
      const { data } = await apiRequest<UploadResult[]>(
        api.post(`/upload${type ? `?type=${type}` : ''}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (event) => {
            const percentCompleted = Math.round(
              (event.loaded * 100) / (event.total ?? 1)
            );
            setProgress(percentCompleted);
          },
        })
      );
      onSuccess?.(Array.isArray(data) ? data : [data]);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };
  return { uploadFiles, isUploading, progress };
};
