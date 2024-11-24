import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmitEventDto } from './dto/emit-event.dto';
import axios from 'axios';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private readonly socketServerUrl: string;
  private readonly socketAppId: string;
  private jwtToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.socketServerUrl = this.config.get<string>('SOCKET_SERVER_URL');
    this.socketAppId = this.config.get<string>('SOCKET_APP_ID', '');
    this.jwtToken = '';
  }

  async createAuthToken(jwtPayload: any) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get('SOCKET_AUTH_SECRET'),
      expiresIn: this.config.get('SOCKET_AUTH_EXPIRES_IN', '1d'),
    });
  }

  async emitEvent(payload: EmitEventDto): Promise<void> {
    console.info('Emitting event:', payload.event, 'to room:', payload.room);
    try {
      // TODO: socket auth token from config
      if (!this.jwtToken || this.jwtToken === '') {
        const token = await this.createAuthToken({ appId: this.socketAppId });
        this.jwtToken = token;
      }

      const route = `${this.socketServerUrl}/v1/socket/emit/${this.socketAppId}`;

      const response = await axios.post(route, payload, {
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to emit event');
      }
    } catch (error) {
      this.logger.error(
        'Failed to emit event:',
        payload.event,
        'to room:',
        payload.room,
      );
    }
  }
}
