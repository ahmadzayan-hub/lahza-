'use strict';
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const core = require('./lib/core');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#fff7fa',
    title: 'وصال — Wisal',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // مفيش نوافذ منبثقة ولا تنقّل خارج ملفات التطبيق المحلية.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, target) => {
    if (!target.startsWith('file://')) event.preventDefault();
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  core.init(app.getPath('userData'));
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerIpc() {
  const handlers = {
    'settings:get': () => core.getSettings(),
    'settings:set': (patch) => core.setSettings(patch),
    'people:get': () => core.getPeople(),
    'people:set': (list) => core.setPeople(list),
    'meta:get': () => ({ relations: core.RELATIONS, dialects: core.DIALECTS, intents: core.INTENTS }),
    'stats:get': () => core.stats(),
    'store:get': () => core.getStore(),
    'recipient:current': () => core.currentRecipient(),
    'generate': (opts) => core.generate(opts || {}),
    'refine': ({ text, styleId }) => core.refine(text, styleId),
    'giftIdeas': ({ occasionLabel }) => core.giftIdeas(occasionLabel),
    'favorite:toggle': ({ text }) => core.toggleFavorite(text),
    'history:delete': ({ date, text }) => { core.deleteHistory(date, text); return true; },
    'openExternal': ({ url }) => {
      // بنفتح روابط https بس (والمقصود عملياً wa.me) — مش أي string جاي من الواجهة.
      let parsed;
      try { parsed = new URL(String(url)); } catch (e) { return false; }
      if (parsed.protocol !== 'https:') return false;
      shell.openExternal(parsed.toString());
      return true;
    },
    // التعلّم عند اختيار/تعديل اقتراح
    'learn:choose': ({ text, theme, recipientId, slot, themesShown }) => {
      core.addStyleExample(text, theme, recipientId);
      core.bumpTheme(theme, 0.3);
      core.addFeedback({ date: core.todayISO(), slot: slot || 'manual', themesShown: themesShown || [], choice: 'pick', finalText: text, recipientId: recipientId || '' });
      core.markContacted(recipientId);
      return true;
    },
    'learn:edit': ({ text, theme, recipientId, slot, themesShown }) => {
      core.addStyleExample(text, theme, recipientId);
      core.addFeedback({ date: core.todayISO(), slot: slot || 'manual', themesShown: themesShown || [], choice: 'edited', finalText: text, recipientId: recipientId || '' });
      core.markContacted(recipientId);
      return true;
    },
  };
  Object.keys(handlers).forEach((ch) => {
    ipcMain.handle(ch, async (_e, payload) => {
      try { return { ok: true, data: await handlers[ch](payload) }; }
      catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
    });
  });
}
