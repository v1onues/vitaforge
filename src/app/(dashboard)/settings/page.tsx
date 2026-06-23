'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { db } from '@/lib/db/schema';
import {
  Palette,
  Shield,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
  Database,
  Trash2,
  AlertTriangle,
  Bot,
  Film,
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const { logout } = useAuthStore();
  const [lockTimeout, setLockTimeout] = useState(15);

  useEffect(() => {
    db.settings.get('main').then((s) => {
      if (s) setLockTimeout(s.lockTimeout);
    });
  }, []);

  const handleLockTimeoutChange = async (value: number) => {
    setLockTimeout(value);
    await db.settings.update('main', { lockTimeout: value });
  };
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dbStats, setDbStats] = useState<Record<string, number> | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // AI settings
  const [aiProvider, setAiProvider] = useState('openrouter');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiSaved, setAiSaved] = useState(false);
  const [savingAi, setSavingAi] = useState(false);

  // TMDB settings
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [tmdbSaved, setTmdbSaved] = useState(false);
  const [savingTmdb, setSavingTmdb] = useState(false);

  // Google Books settings
  const [googleBooksApiKey, setGoogleBooksApiKey] = useState('');
  const [booksSaved, setBooksSaved] = useState(false);
  const [savingBooks, setSavingBooks] = useState(false);

  // Last.fm settings
  const [lastfmApiKey, setLastfmApiKey] = useState('');
  const [lastfmSaved, setLastfmSaved] = useState(false);
  const [savingLastfm, setSavingLastfm] = useState(false);

  // RAWG settings
  const [rawgApiKey, setRawgApiKey] = useState('');
  const [rawgSaved, setRawgSaved] = useState(false);
  const [savingRawg, setSavingRawg] = useState(false);

  useEffect(() => {
    db.settings.get('main').then((s) => {
      if (s) {
        setAiProvider(s.aiProvider || 'openrouter');
        setAiApiKey(s.aiApiKey || '');
        setAiModel(s.aiModel || '');
        setTmdbApiKey(s.tmdbApiKey || '');
        setGoogleBooksApiKey(s.googleBooksApiKey || '');
        setLastfmApiKey(s.lastfmApiKey || '');
        setRawgApiKey(s.rawgApiKey || '');
      }
    });
  }, []);

  const handleSaveAi = async () => {
    setSavingAi(true);
    try {
      await db.settings.update('main', { aiProvider, aiApiKey, aiModel });
      setAiSaved(true);
      setTimeout(() => setAiSaved(false), 2000);
    } finally {
      setSavingAi(false);
    }
  };

  const handleSaveTmdb = async () => {
    setSavingTmdb(true);
    try {
      await db.settings.update('main', { tmdbApiKey });
      setTmdbSaved(true);
      setTimeout(() => setTmdbSaved(false), 2000);
    } finally {
      setSavingTmdb(false);
    }
  };

  const handleSaveBooks = async () => {
    setSavingBooks(true);
    try {
      await db.settings.update('main', { googleBooksApiKey });
      setBooksSaved(true);
      setTimeout(() => setBooksSaved(false), 2000);
    } finally {
      setSavingBooks(false);
    }
  };

  const handleSaveLastfm = async () => {
    setSavingLastfm(true);
    try {
      await db.settings.update('main', { lastfmApiKey });
      setLastfmSaved(true);
      setTimeout(() => setLastfmSaved(false), 2000);
    } finally {
      setSavingLastfm(false);
    }
  };

  const handleSaveRawg = async () => {
    setSavingRawg(true);
    try {
      await db.settings.update('main', { rawgApiKey });
      setRawgSaved(true);
      setTimeout(() => setRawgSaved(false), 2000);
    } finally {
      setSavingRawg(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setChangingPassword(true);
    try {
      const profile = await db.profiles.get('main');
      if (!profile) throw new Error('Profil bulunamadı');
      const { encryption } = await import('@/lib/crypto/encryption');
      const result = await encryption.changePassword(
        currentPassword,
        newPassword,
        profile.salt,
        profile.verifier
      );
      await db.profiles.put({
        ...profile,
        salt: result.salt,
        verifier: result.verifier,
        updatedAt: Date.now(),
      });
      setPasswordSuccess('Şifre başarıyla güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Şifre değiştirme başarısız oldu.');
    } finally {
      setChangingPassword(false);
    }
  };

  const loadStats = async () => {
    const stats: Record<string, number> = {};
    stats.projects = await db.projects.count();
    stats.tasks = await db.tasks.count();
    stats.projectGroups = await db.projectGroups.count();
    stats.habits = await db.habits.count();
    stats.habitLogs = await db.habitLogs.count();
    stats.notes = await db.notes.count();
    stats.goals = await db.goals.count();
    stats.moodLogs = await db.moodLogs.count();
    stats.fitnessLogs = await db.fitnessLogs.count();
    stats.dictionLogs = await db.dictionLogs.count();
    setDbStats(stats);
  };

  const handleExport = async (encrypted: boolean) => {
    setExporting(true);
    try {
      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        projects: await db.projects.toArray(),
        tasks: await db.tasks.toArray(),
        projectGroups: await db.projectGroups.toArray(),
        habits: await db.habits.toArray(),
        habitLogs: await db.habitLogs.toArray(),
        notes: await db.notes.toArray(),
        goals: await db.goals.toArray(),
        lifeAreas: await db.lifeAreas.toArray(),
        moodLogs: await db.moodLogs.toArray(),
        fitnessLogs: await db.fitnessLogs.toArray(),
        dictionLogs: await db.dictionLogs.toArray(),
        readingItems: await db.readingItems.toArray(),
        mediaItems: await db.mediaItems.toArray(),
        transactions: await db.transactions.toArray(),
        activityLogs: await db.activityLogs.toArray(),
        journalEntries: await db.journalEntries.toArray(),
        gratitudeEntries: await db.gratitudeEntries.toArray(),
        sleepLogs: await db.sleepLogs.toArray(),
        monitoredEndpoints: await db.monitoredEndpoints.toArray(),
        radioStations: await db.radioStations.toArray(),
        settings: await db.settings.toArray(),
      };

      let exportData: string;
      let filename: string;
      let mimeType: string;

      if (encrypted) {
        const { encryption } = await import('@/lib/crypto/encryption');
        if (!encryption.isInitialized()) {
          alert('Şifreleme için önce giriş yapmalısın.');
          return;
        }
        exportData = await encryption.encrypt(JSON.stringify(data));
        filename = `vitaforge-backup-${new Date().toISOString().split('T')[0]}.enc`;
        mimeType = 'application/octet-stream';
      } else {
        exportData = JSON.stringify(data, null, 2);
        filename = `vitaforge-backup-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Dışa aktarma hatası:', err);
      alert('Dışa aktarma başarısız oldu.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let data: Record<string, unknown[]>;

      if (file.name.endsWith('.enc')) {
        const { encryption } = await import('@/lib/crypto/encryption');
        if (!encryption.isInitialized()) {
          alert('Şifreli dosyayı çözmek için önce giriş yapmalısın.');
          return;
        }
        const decrypted = await encryption.decrypt(text);
        data = JSON.parse(decrypted);
      } else {
        data = JSON.parse(text);
      }

      if (data.projects) await db.projects.bulkPut(data.projects as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.tasks) await db.tasks.bulkPut(data.tasks as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.projectGroups) await db.projectGroups.bulkPut(data.projectGroups as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.habits) await db.habits.bulkPut(data.habits as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.habitLogs) await db.habitLogs.bulkPut(data.habitLogs as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.notes) await db.notes.bulkPut(data.notes as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.goals) await db.goals.bulkPut(data.goals as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.lifeAreas) await db.lifeAreas.bulkPut(data.lifeAreas as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.moodLogs) await db.moodLogs.bulkPut(data.moodLogs as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.fitnessLogs) await db.fitnessLogs.bulkPut(data.fitnessLogs as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.dictionLogs) await db.dictionLogs.bulkPut(data.dictionLogs as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.readingItems) await db.readingItems.bulkPut(data.readingItems as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.mediaItems) await db.mediaItems.bulkPut(data.mediaItems as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.transactions) await db.transactions.bulkPut(data.transactions as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.activityLogs) await db.activityLogs.bulkPut(data.activityLogs as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.journalEntries) await db.journalEntries.bulkPut(data.journalEntries as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.gratitudeEntries) await db.gratitudeEntries.bulkPut(data.gratitudeEntries as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.sleepLogs) await db.sleepLogs.bulkPut(data.sleepLogs as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.monitoredEndpoints) await db.monitoredEndpoints.bulkPut(data.monitoredEndpoints as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (data.radioStations) await db.radioStations.bulkPut(data.radioStations as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any

      alert('Veriler başarıyla içe aktarıldı!');
      window.location.reload();
    } catch (err) {
      console.error('İçe aktarma hatası:', err);
      alert('İçe aktarma başarısız oldu. Dosya formatını kontrol et.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Emin misin?')) return;
    if (!confirm('Son uyarı! Tüm veriler kalıcı olarak silinecek. Devam et?')) return;

    await db.projects.clear();
    await db.tasks.clear();
    await db.projectGroups.clear();
    await db.habits.clear();
    await db.habitLogs.clear();
    await db.notes.clear();
    await db.goals.clear();
    await db.lifeAreas.clear();
    await db.moodLogs.clear();
    await db.fitnessLogs.clear();
    await db.dictionLogs.clear();
    await db.readingItems.clear();
    await db.mediaItems.clear();
    await db.transactions.clear();
    await db.activityLogs.clear();
    await db.journalEntries.clear();
    await db.gratitudeEntries.clear();
    await db.sleepLogs.clear();
    await db.monitoredEndpoints.clear();
    await db.radioStations.clear();
    await db.settings.clear();
    await db.profiles.clear();

    logout();
    window.location.href = '/setup';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Uygulama tercihlerini yönet</p>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Görünüm
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="data">
            <Download className="w-4 h-4 mr-2" />
            Veri
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="w-4 h-4 mr-2" />
            AI Asistan
          </TabsTrigger>
          <TabsTrigger value="media">
            <Film className="w-4 h-4 mr-2" />
            Medya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Uygulama görünümünü özelleştir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="h-24 flex-col gap-2"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-6 h-6" />
                  <span>Açık</span>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="h-24 flex-col gap-2"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-6 h-6" />
                  <span>Koyu</span>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="h-24 flex-col gap-2"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="w-6 h-6" />
                  <span>Sistem</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Otomatik Kilit</CardTitle>
              <CardDescription>Hareketsizlik sonrası otomatik kilitleme süresi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={lockTimeout}
                    onChange={(e) => handleLockTimeoutChange(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">dakika</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Belirtilen süre boyunca hareket edilmezse uygulama otomatik olarak kilitlenir.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>Master şifreni güncelle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Mevcut şifre"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Yeni şifre"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Yeni şifre tekrar"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-500">{passwordSuccess}</p>
                )}
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6 space-y-6">
          {/* Veri İstatistikleri */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Veri İstatistikleri</CardTitle>
                <CardDescription>Mevcut verilerin özeti</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadStats}>
                <Database className="w-4 h-4 mr-2" />
                Yükle
              </Button>
            </CardHeader>
            <CardContent>
              {dbStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dbStats).map(([key, value]) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {key === 'projects' ? 'Proje' :
                         key === 'tasks' ? 'Görev' :
                         key === 'habits' ? 'Alışkanlık' :
                         key === 'habitLogs' ? 'Alışkanlık Kaydı' :
                         key === 'notes' ? 'Not' :
                         key === 'goals' ? 'Hedef' :
                         key === 'moodLogs' ? 'Mood Kaydı' : key}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  İstatistikleri yüklemek için &quot;Yükle&quot; butonuna bas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dışa Aktar */}
          <Card>
            <CardHeader>
              <CardTitle>Dışa Aktar</CardTitle>
              <CardDescription>Verilerini farklı formatlarda dışa aktar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={exporting}
                  onClick={() => handleExport(false)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Dışa aktarılıyor...' : 'JSON olarak dışa aktar'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={exporting}
                  onClick={() => handleExport(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Dışa aktarılıyor...' : 'Şifreli JSON olarak dışa aktar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* İçe Aktar */}
          <Card>
            <CardHeader>
              <CardTitle>İçe Aktar</CardTitle>
              <CardDescription>Yedek dosyasından verileri geri yükle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Yedek dosyasını seçin (JSON veya .enc)
                  </p>
                  <input
                    type="file"
                    accept=".json,.enc"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-file')?.click()}
                    disabled={importing}
                  >
                    {importing ? 'İçe aktarılıyor...' : 'Dosya Seç'}
                  </Button>
                </div>
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Bu işlem mevcut verilerin üzerine yazacaktır. Devam etmeden önce yedek aldığınızdan emin olun.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tüm Verileri Sil */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Tüm Verileri Sil</CardTitle>
              <CardDescription>Bu işlem geri alınamaz</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Tüm Verileri Sil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medya API Yapılandırması</CardTitle>
              <CardDescription>
                Film, dizi ve kitap bilgilerini otomatik çekmek için API anahtarlarını gir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">TMDB API Key (Filmler &amp; Diziler)</label>
                  <Input
                    type="password"
                    placeholder="Giriş (eyJ...)"
                    value={tmdbApiKey}
                    onChange={(e) => setTmdbApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    themoviedb.org &apos;a üye olup ücretsiz API key almalısın. Settings &rarr; API &rarr; Create.
                  </p>
                </div>
                <Button onClick={handleSaveTmdb} disabled={savingTmdb}>
                  {tmdbSaved ? 'Kaydedildi!' : savingTmdb ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium">Google Books API Key (Kitaplar)</label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={googleBooksApiKey}
                  onChange={(e) => setGoogleBooksApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  console.cloud.google.com &apos;da &quot;Books API&quot;yi etkinleştirip API key oluşturmalısın.
                </p>
              </div>
              <Button onClick={handleSaveBooks} disabled={savingBooks}>
                {booksSaved ? 'Kaydedildi!' : savingBooks ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium">Last.fm API Key (Müzik)</label>
                <Input
                  type="password"
                  placeholder="Son ekrandaki API key"
                  value={lastfmApiKey}
                  onChange={(e) => setLastfmApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  last.fm/api &apos;de ücretsiz hesap oluşturup API key almalısın.
                </p>
              </div>
              <Button onClick={handleSaveLastfm} disabled={savingLastfm}>
                {lastfmSaved ? 'Kaydedildi!' : savingLastfm ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium">RAWG API Key (Oyunlar)</label>
                <Input
                  type="password"
                  placeholder="RAWG API key"
                  value={rawgApiKey}
                  onChange={(e) => setRawgApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  rawg.io/apidocs &apos;de ucretsiz hesap olusturup API key almalisin.
                </p>
              </div>
              <Button onClick={handleSaveRawg} disabled={savingRawg}>
                {rawgSaved ? 'Kaydedildi!' : savingRawg ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Asistan Yapılandırması</CardTitle>
              <CardDescription>
                Doğal dil ile uygulamayı yönetmek için AI sağlayıcı bilgilerini gir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sağlayıcı</label>
                  <div className="flex gap-2">
                    <Button
                      variant={aiProvider === 'openrouter' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('openrouter')}
                      className="flex-1"
                    >
                      OpenRouter
                    </Button>
                    <Button
                      variant={aiProvider === 'groq' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('groq')}
                      className="flex-1"
                    >
                      Groq
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    type="password"
                    placeholder={aiProvider === 'groq' ? 'gsk_...' : 'sk-or-...'}
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    API key&apos;iniz şifrelenerek sadece cihazınızda saklanır, hiçbir yere gönderilmez.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Model (opsiyonel)</label>
                  <Input
                    placeholder={aiProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'openai/gpt-4o-mini'}
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Boş bırakılırsa varsayılan model kullanılır.
                  </p>
                </div>

                <Button onClick={handleSaveAi} disabled={savingAi}>
                  {aiSaved ? 'Kaydedildi!' : savingAi ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
