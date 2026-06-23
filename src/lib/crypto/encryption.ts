const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

export class EncryptionService {
  private key: CryptoKey | null = null;
  private salt: string | null = null;

  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer as ArrayBuffer;
  }

  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as ArrayBuffer,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async createVerifier(
    password: string,
    salt: Uint8Array
  ): Promise<string> {
    const key = await this.deriveKey(password, salt);
    const encoder = new TextEncoder();
    const testData = encoder.encode('vitaforge-verify');
    const iv = this.generateRandomBytes(IV_LENGTH);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
      key,
      testData
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return this.bufferToBase64(combined.buffer as ArrayBuffer);
  }

  async setupPassword(password: string): Promise<{
    salt: string;
    verifier: string;
  }> {
    const salt = this.generateRandomBytes(SALT_LENGTH);
    const verifier = await this.createVerifier(password, salt);
    
    this.salt = this.bufferToBase64(salt.buffer as ArrayBuffer);
    this.key = await this.deriveKey(password, salt);
    
    return {
      salt: this.salt,
      verifier
    };
  }

  async verifyPassword(
    password: string,
    storedSalt: string,
    storedVerifier: string
  ): Promise<boolean> {
    try {
      const salt = new Uint8Array(this.base64ToBuffer(storedSalt));
      const key = await this.deriveKey(password, salt);
      
      const decoder = new Uint8Array(this.base64ToBuffer(storedVerifier));
      const iv = decoder.slice(0, IV_LENGTH);
      const encrypted = decoder.slice(IV_LENGTH);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
        key,
        encrypted as unknown as ArrayBuffer
      );
      
      const decryptedText = new TextDecoder().decode(decrypted);
      if (decryptedText !== 'vitaforge-verify') {
        return false;
      }
      
      this.key = key;
      this.salt = storedSalt;
      return true;
    } catch {
      return false;
    }
  }

  async encrypt(data: string): Promise<string> {
    if (!this.key) throw new Error('Key not initialized');
    
    const encoder = new TextEncoder();
    const iv = this.generateRandomBytes(IV_LENGTH);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
      this.key,
      encoder.encode(data)
    );
    
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return this.bufferToBase64(result.buffer as ArrayBuffer);
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.key) throw new Error('Key not initialized');
    
    const data = new Uint8Array(this.base64ToBuffer(encryptedData));
    const iv = data.slice(0, IV_LENGTH);
    const ciphertext = data.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
      this.key,
      ciphertext as unknown as ArrayBuffer
    );
    
    return new TextDecoder().decode(decrypted);
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    storedSalt: string,
    storedVerifier: string
  ): Promise<{ salt: string; verifier: string }> {
    const isValid = await this.verifyPassword(currentPassword, storedSalt, storedVerifier);
    if (!isValid) {
      throw new Error('Mevcut şifre yanlış');
    }
    return this.setupPassword(newPassword);
  }

  clearSession(): void {
    this.key = null;
    this.salt = null;
  }

  isInitialized(): boolean {
    return this.key !== null;
  }
}

export const encryption = new EncryptionService();
