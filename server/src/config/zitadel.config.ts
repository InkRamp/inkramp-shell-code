import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Zitadel API Configuration
 * Provides authenticated API client for Zitadel management
 * 
 * NOTE: Token management is simplified for development.
 * TODO: For production, implement:
 * 1. Token refresh logic before expiration
 * 2. Retry failed requests with new tokens
 * 3. Token expiration monitoring
 * 4. Proper error handling for authentication failures
 */
export class ZitadelConfig {
  private static instance: ZitadelConfig;
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;

  private readonly issuer: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  private constructor() {
    this.issuer = process.env.ZITADEL_ISSUER || '';
    this.clientId = process.env.ZITADEL_CLIENT_ID || '';
    this.clientSecret = process.env.ZITADEL_CLIENT_SECRET || '';

    if (!this.issuer || !this.clientId || !this.clientSecret) {
      console.warn('⚠️  Zitadel credentials not configured. Using mock mode.');
    }

    this.apiClient = axios.create({
      baseURL: `${this.issuer}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): ZitadelConfig {
    if (!ZitadelConfig.instance) {
      ZitadelConfig.instance = new ZitadelConfig();
    }
    return ZitadelConfig.instance;
  }

  /**
   * Get authenticated API client
   */
  public async getApiClient(): Promise<AxiosInstance> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    return this.apiClient;
  }

  /**
   * Authenticate with Zitadel using client credentials
   */
  private async authenticate(): Promise<void> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Zitadel credentials not configured');
      }

      const response = await axios.post(
        `${this.issuer}/oauth/v2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      console.log('✅ Authenticated with Zitadel');
    } catch (error) {
      console.error('❌ Failed to authenticate with Zitadel:', error);
      throw error;
    }
  }

  /**
   * Get base URL for API endpoints
   */
  public getBaseUrl(): string {
    return this.issuer;
  }

  /**
   * Check if Zitadel is configured
   */
  public isConfigured(): boolean {
    return !!(this.issuer && this.clientId && this.clientSecret);
  }
}

export default ZitadelConfig.getInstance();
