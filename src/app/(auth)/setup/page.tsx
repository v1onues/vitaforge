'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';

export default function SetupPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setup, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    if (password.length < 6) {
      return;
    }
    
    await setup(password);
    router.push('/');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">VitaForge&apos;a Hoş Geldin</CardTitle>
        <CardDescription>
          Verilerini korumak için bir master şifre belirle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Master Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Şifre Tekrar</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifreyi tekrar gir"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Şifreler eşleşmiyor</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || password.length < 6 || password !== confirmPassword}
          >
            {isLoading ? 'Oluşturuluyor...' : 'Şifre Belirle'}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Şifren tarayıcında saklanmaz. Tüm veriler AES-256 ile şifrelenir.
            Şifreni unutursan verilerine erişemezsin.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
