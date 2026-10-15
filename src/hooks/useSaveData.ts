import { useEffect, useState } from 'react';

type NetworkInformation = EventTarget & {
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
};

export function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const conn = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
    if (conn?.saveData) {
      setSaveData(true);
      const onChange = () => setSaveData(!!conn.saveData);
      conn.addEventListener('change', onChange);
      return () => conn.removeEventListener('change', onChange);
    }
  }, []);

  return saveData;
}
