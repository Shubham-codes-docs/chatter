import SettingsLayout from '../../components/settings/SettingsLayOut';
import SideBar from '../../components/settings/SideBar';
import SettingsProfileTab from '../../components/settings/SettingsProfileTab';
import SettingsAppearanceTab from '../../components/settings/SettingsAppearanceTab';
import SettingsNotifications from '../../components/settings/SettingsNotifications';
import SettingsAccount from '../../components/settings/SettingsAccount';
import SettingsPrivacy from '../../components/settings/SettingsPrivacy';
import { Tabs, TabsContent } from '../../components/ui/tabs';

const Settings = () => {
  const SettingsContent = [
    {
      id: 'profile',
      content: <SettingsProfileTab />,
    },
    {
      id: 'appearance',
      content: <SettingsAppearanceTab />,
    },
    {
      id: 'notification',
      content: <SettingsNotifications />,
    },
    {
      id: 'account',
      content: <SettingsAccount />,
    },
    {
      id: 'privacy',
      content: <SettingsPrivacy />,
    },
  ];

  return (
    <SettingsLayout>
      <Tabs defaultValue="profile" className="flex w-full">
        <SideBar />
        <div className="flex-1 p-6">
          {SettingsContent.map(({ id, content }) => (
            <TabsContent key={id} value={id}>
              {content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </SettingsLayout>
  );
};

export default Settings;
