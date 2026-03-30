import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  profileSchema,
  type ProfileFormData,
} from '../../schemas/profile.schema';
import { BsCamera } from 'react-icons/bs';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { toast } from 'sonner';
import { handleApiError } from '../../utils/errorHandler';
import { useFileUpload } from '../../hooks/useFileUpload';

const SettingsProfileTab = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { user, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    getValues,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      userName: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  });

  const handleProfileUpdate = async (
    formData: ProfileFormData,
    avatarUrl?: string
  ) => {
    const updatedUser = await userService.updateProfile(
      formData.fullName,
      formData.userName,
      formData.bio ?? '',
      avatarUrl ?? user?.avatar
    );
    setUser(updatedUser);
    toast.success('Profile updated successfully');
  };

  const { uploadFiles, isUploading, progress } = useFileUpload({
    type: 'avatar',
    onSuccess: async (results) => {
      const avatarUrl = results[0].url;
      const formValues = getValues();
      await handleProfileUpdate(formValues, avatarUrl);
      setAvatarFile(null);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (avatarFile) {
        // upload avatar first — onSuccess handles full profile update
        await uploadFiles([avatarFile]);
      } else {
        // no avatar change — just update profile fields
        await handleProfileUpdate(data);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div>
      <h2 className="h2-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={avatarPreview || user?.avatar || '/default-avatar.png'}
                alt="User Avatar"
              />
              <AvatarFallback>
                {user?.fullName?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 rounded-full p-2 cursor-pointer transition-colors"
            >
              <BsCamera className="w-4 h-4 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <p className="body-medium font-semibold">Profile Picture</p>
            <p className="small-regular text-secondary">
              Click the camera icon to upload a new photo
            </p>
            {avatarFile && !isUploading && (
              <p className="tiny-regular text-brand-primary">
                {avatarFile.name} selected — click Save Changes to upload
              </p>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="tiny-regular text-secondary">
                Uploading avatar...
              </span>
              <span className="tiny-regular text-brand-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-light-300 dark:bg-dark-200 rounded-full h-1.5">
              <div
                className="gradient-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="small-semibold text-secondary block mb-2"
          >
            Full Name
          </label>
          <input
            {...register('fullName')}
            id="fullName"
            className="input w-full"
          />
          {errors.fullName && (
            <p className="text-error text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="userName"
            className="small-semibold text-secondary block mb-2"
          >
            Username
          </label>
          <input
            {...register('userName')}
            id="userName"
            className="input w-full"
          />
          {errors.userName && (
            <p className="text-error text-sm mt-1">{errors.userName.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="bio"
            className="small-semibold text-secondary block mb-2"
          >
            Bio
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            className="input w-full min-h-[100px] resize-none"
          />
          {errors.bio && (
            <p className="text-error text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="small-semibold text-secondary block mb-2"
          >
            Email Address
          </label>
          <input
            {...register('email')}
            id="email"
            className="input w-full opacity-60 cursor-not-allowed"
            disabled
          />
          <p className="tiny-regular text-muted mt-1">
            Email cannot be changed
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={(!isDirty && !avatarFile) || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default SettingsProfileTab;
