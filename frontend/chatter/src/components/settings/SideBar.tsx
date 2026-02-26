import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BsPersonFill,
  BsPaletteFill,
  BsBellFill,
  BsShieldFill,
  BsGearFill,
} from 'react-icons/bs';
import type { IconType } from 'react-icons';

interface Tabs {
  id: string;
  label: string;
  icon: IconType;
  value: string;
}

const SideBar = () => {
  const Tabs: Tabs[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: BsPersonFill,
      value: 'profile',
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: BsPaletteFill,
      value: 'appearance',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: BsBellFill,
      value: 'notification',
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: BsShieldFill,
      value: 'privacy',
    },
    { id: 'account', label: 'Account', icon: BsGearFill, value: 'account' },
  ];

  return (
    <TabsList className="flex flex-col w-56 h-auto bg-transparent border-r border-default p-4 space-y-2">
      {Tabs.map(({ value, label, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className="w-full justify-start gap-3 p-3 rounded-lg data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-500 dark:data-[state=active]:text-primary-400"
        >
          <Icon className="w-5 h-5" />
          <span className="body-medium">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default SideBar;
