import { Router, Request, Response } from 'express';
import { db } from '../../config/database';

export const settingsRouter = Router();

// Get settings
settingsRouter.get('/', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settingsObj: Record<string, string> = {
    outletName: 'Chai Wala Original',
    branchAddress: 'Shop #4, Near Clock Tower, Tirupati, AP',
    fssaiNumber: '10123028000451',
    gstNumber: '37AAAAA0000A1Z5',
    paperWidth: '80mm',
    footerMessage: 'Thank you for visiting! Have a fresh cutting chai day ☕',
    autoPrintToken: 'true'
  };

  for (const r of rows as any[]) {
    settingsObj[r.key] = r.value;
  }
  res.json({ settings: settingsObj });
});

// Save settings
settingsRouter.post('/', (req: Request, res: Response) => {
  const { settings } = req.body;
  if (!settings) return res.status(400).json({ error: 'Settings object required' });

  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?');
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      upsert.run(key, String(value), String(value));
    }
  });

  tx();
  res.json({ success: true, message: 'Settings saved' });
});
