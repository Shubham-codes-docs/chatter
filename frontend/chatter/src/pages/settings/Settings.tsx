import { useState } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayOut';
import SideBar from '../../components/settings/SideBar';
import SettingsProfileTab from '../../components/settings/SettingsProfileTab';
import SettingsAppearanceTab from '../../components/settings/SettingsAppearanceTab';
import SettingsNotifications from '../../components/settings/SettingsNotifications';
import SettingsAccount from '../../components/settings/SettingsAccount';
import SettingsPrivacy from '../../components/settings/SettingsPrivacy';
import { Tabs, TabsContent } from '../../components/ui/tabs';
import { IoArrowBack } from 'react-icons/io5';

const Settings = () => {
  const [mobileShowContent, setMobileShowContent] = useState(false);

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
      <Tabs
        defaultValue="profile"
        className="flex w-full"
        onValueChange={() => setMobileShowContent(true)}
      >
        <div
          className={`${mobileShowContent ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}
        >
          <SideBar />
        </div>
        <div
          className={`${mobileShowContent ? 'flex' : 'hidden md:flex'} flex-1 flex-col p-6`}
        >
          <button
            className="flex items-center gap-2 mb-4 md:hidden text-secondary"
            onClick={() => setMobileShowContent(false)}
          >
            <IoArrowBack size={18} />
            <span className="small-regular">Back to Settings</span>
          </button>
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
