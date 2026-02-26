import { useState } from 'react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

const SettingsNotifications = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved
      ? JSON.parse(saved)
      : {
          pushNotifications: true,
          messageSounds: true,
          desktopNotifications: false,
          emailNotifications: true,
        };
  });

  const updateSettings = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  return (
    <div>
      <h2 className="h2-bold mb-6">Notification Settings</h2>
      <div className="space-y-6">
        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-default">
          <div className="flex-1">
            <Label className="body-medium font-semibold block mb-1">
              Push Notifications
            </Label>
            <p className="small-regular text-secondary">
              Receive notifications for new messages
            </p>
          </div>
          <Switch
            checked={settings.pushNotifications}
            onCheckedChange={(value) =>
              updateSettings('pushNotifications', value)
            }
          />
        </div>

        {/* Message Sounds */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-default">
          <div className="flex-1">
            <Label className="body-medium font-semibold block mb-1">
              Message Sounds
            </Label>
            <p className="small-regular text-secondary">
              Play sound when receiving messages
            </p>
          </div>
          <Switch
            checked={settings.messageSounds}
            onCheckedChange={(value) => updateSettings('messageSounds', value)}
          />
        </div>

        {/* Desktop Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-default">
          <div className="flex-1">
            <Label className="body-medium font-semibold block mb-1">
              Desktop Notifications
            </Label>
            <p className="small-regular text-secondary">
              Show notifications on your desktop
            </p>
          </div>
          <Switch
            checked={settings.desktopNotifications}
            onCheckedChange={(value) =>
              updateSettings('desktopNotifications', value)
            }
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-default">
          <div className="flex-1">
            <Label className="body-medium font-semibold block mb-1">
              Email Notifications
            </Label>
            <p className="small-regular text-secondary">
              Receive email for missed messages
            </p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(value) =>
              updateSettings('emailNotifications', value)
            }
          />
        </div>
      </div>

      <div className="mt-6 bg-light-100 dark:bg-dark-400 p-4 rounded-lg">
        <p className="small-regular text-secondary">
          💡 Your notification preferences are saved automatically
        </p>
      </div>
    </div>
  );
};

export default SettingsNotifications;
