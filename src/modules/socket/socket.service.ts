import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmitEventDto } from './dto/emit-event.dto';
import type { AxiosInstance } from 'axios';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private readonly socketServerUrl: string;
  private readonly socketAppId: string;
  private jwtToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('HTTP_CLIENT')
    private readonly httpClient: AxiosInstance,
  ) {
    this.socketServerUrl = this.config.get<string>('SOCKET_SERVER_URL');
    this.socketAppId = this.config.get<string>('SOCKET_APP_ID', '');

    this.jwtToken = this.createAuthToken({ appId: this.socketAppId });
  }

  createAuthToken(jwtPayload: any) {
    // TODO: refactor socket jwtAuth
    return this.jwtService.sign(jwtPayload, {
      secret: this.config.get('SOCKET_AUTH_SECRET'),
      // expiresIn: this.config.get('SOCKET_AUTH_EXPIRES_IN', '365d'),
    });
  }

  async emitEvent(payload: EmitEventDto): Promise<void> {
    this.logger.debug(
      `Emitting event: ${payload.event} to room: ${payload.room}`,
    );
    try {
      const route = `${this.socketServerUrl}/v1/socket/emit/${this.socketAppId}`;
      const response = await this.httpClient.post(route, payload, {
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to emit event');
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to emit event: ${payload.event} to room: ${payload.room}, Reason: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
