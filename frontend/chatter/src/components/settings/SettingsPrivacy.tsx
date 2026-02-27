import { useState } from 'react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const SettingsPrivacy = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('privacySettings');
    return saved
      ? JSON.parse(saved)
      : {
          showLastSeen: true,
          showReadReceipts: true,
          profilePhotoVisibility: 'everyone',
          whoCanMessageMe: 'everyone',
        };
  });

  const updateSetting = (key: string, value: string | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('privacySettings', JSON.stringify(newSettings));
  };

  return (
    <div>
      <h2 className="h2-bold mb-6">Privacy Settings</h2>

      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-default">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <Label className="body-medium font-semibold block mb-1">
                Show Last Seen
              </Label>
              <p className="small-regular text-secondary">
                Let others see when you were last online
              </p>
            </div>
            <Switch
              checked={settings.showLastSeen}
              onCheckedChange={(value) => updateSetting('showLastSeen', value)}
            />
          </div>
        </div>
        <div className="p-4 rounded-lg border border-default">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <Label className="body-medium font-semibold block mb-1">
                Show Read Receipts
              </Label>
              <p className="small-regular text-secondary">
                Let others know when you&apos;ve read their messages
              </p>
            </div>
            <Switch
              checked={settings.showReadReceipts}
              onCheckedChange={(value) =>
                updateSetting('showReadReceipts', value)
              }
            />
          </div>
        </div>
        <div className="p-4 rounded-lg border border-default">
          <Label className="body-medium font-semibold block mb-2">
            Profile Photo Visibility
          </Label>
          <p className="small-regular text-secondary mb-3">
            Choose who can see your profile photo
          </p>
          <Select
            value={settings.profilePhotoVisibility}
            onValueChange={(value) =>
              updateSetting('profilePhotoVisibility', value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="contacts">Contacts Only</SelectItem>
              <SelectItem value="nobody">Nobody</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="p-4 rounded-lg border border-default">
          <Label className="body-medium font-semibold block mb-2">
            Who Can Message Me
          </Label>
          <p className="small-regular text-secondary mb-3">
            Control who can send you messages
          </p>
          <Select
            value={settings.whoCanMessageMe}
            onValueChange={(value) => updateSetting('whoCanMessageMe', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="contacts">Contacts Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-6 bg-light-100 dark:bg-dark-400 p-4 rounded-lg">
        <p className="small-regular text-secondary">
          🔒 Your privacy settings are saved automatically and will be enforced
          once backend is connected
        </p>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
