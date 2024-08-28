import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { PLUGIN_ID } from '../constants';

class Settings {
  private static instance: ISettingRegistry.ISettings;

  private constructor() {}

  public static getInstance(): ISettingRegistry.ISettings {
    if (!Settings.instance) {
      throw new Error('SettingsRegistry is not initialized');
    }
    return Settings.instance;
  }

  public static initialize(settings: ISettingRegistry): void {
    if (Settings.instance) {
      throw new Error('SettingsRegistry is already initialized');
    }
    settings.load(PLUGIN_ID).then(setting => {
      Settings.instance = setting;
    });
  }
}

export default Settings;
