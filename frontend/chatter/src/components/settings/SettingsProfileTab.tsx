import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { profileSchema } from '../../schemas/profile.schema';
import { BsCamera } from 'react-icons/bs';

const SettingsProfileTab = () => {
  // type ProfileFormData = z.infer<typeof profileSchema>;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: 'John Doe',
      userName: 'johndoe',
      email: 'john.doe@example.com',
      bio: '',
    },
  });

  // handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = () => {
    // handle form submisssion
  };

  return (
    <div>
      <h2 className="h2-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={avatarPreview || '/default-avatar.png'}
                alt="User Avatar"
              />
              <AvatarFallback>{'JD'}</AvatarFallback>
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
          <div>
            <div>
              <p className="body-medium font-semibold mb-1">Profile Picture</p>
              <p className="small-regular text-secondary">
                Click the camera icon to upload a new photo
              </p>
            </div>
          </div>
        </div>
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
            <p className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="userName"
            className="small-semibold text-secondary block mb-2"
          >
            User Name
          </label>
          <input
            {...register('userName')}
            id="userName"
            className="input w-full"
          />
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.userName.message}
            </p>
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
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>
        <div className="mb-4">
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
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isDirty && !avatarFile}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SettingsProfileTab;
