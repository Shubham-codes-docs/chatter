import { useThemeStore } from '../../store/themeStore';
import { Label } from '../ui/label';

const SettingsAppearanceTab = () => {
  const { theme, toggleTheme } = useThemeStore();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if (newTheme !== theme) {
      toggleTheme();
    }
  };

  return (
    <div>
      <div>
        <h2 className="h2-bold mb-6">Appearance Settings</h2>
        <div className="mb-6">
          <Label className="small-semibold text-secondary block mb-3">
            Theme
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-default hover:border-primary-300'
              }
            `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-100 border border-gray-200" />
                <div>
                  <p className="body-medium font-semibold">Light</p>
                  <p className="small-regular text-secondary">
                    Bright and clean
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-default hover:border-primary-300'
              }
            `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" />
                <div>
                  <p className="body-medium font-semibold">Dark</p>
                  <p className="small-regular text-secondary">
                    Easy on the eyes
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
        <div className="divider my-6" />

        <div className="space-y-4">
          <div>
            <Label className="small-semibold text-secondary block mb-2">
              Message Bubble Style
            </Label>
            <p className="small-regular text-muted">
              Customize message appearance (Coming soon)
            </p>
          </div>

          <div>
            <Label className="small-semibold text-secondary block mb-2">
              Font Size
            </Label>
            <p className="small-regular text-muted">
              Adjust text size (Coming soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAppearanceTab;
