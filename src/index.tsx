import App from './App';
import { createRoot } from 'react-dom/client';
import ISettings from './interfaces/ISettings';
const container = document.getElementById('root');
const root = createRoot(container!);
window.Main.getSettings()
.then((settings: ISettings) => {
  root.render(<App settings={settings} />);
})
.catch((error: Error) => window.Main.error(error));
