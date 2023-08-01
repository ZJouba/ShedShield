import React from 'react';

export default interface ISettingsPage {
  themeState: string;
  setThemeState: React.Dispatch<React.SetStateAction<string>>;
}
