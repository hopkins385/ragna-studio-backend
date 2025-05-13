import {
  ToolContext,
  ToolOptions,
} from '@/modules/assistant-tool-function/interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { HTTP_CLIENT } from '@/modules/http-client/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import { z } from 'zod';
import { ToolProvider } from '../types/tool-provider';

interface DirectionsResponse {}

const directionsSchema = z.object({
  start: z.string().min(1).max(1000).describe('The starting location'),
  destination: z.string().min(1).max(1000).describe('The destination location'),
  waypoints: z
    .array(z.string().min(1).max(1000))
    .optional()
    .describe('The waypoints to visit along the way'),
});

type DirectionsArgs = z.infer<typeof directionsSchema>;

@Injectable()
export class DirectionsTool extends ToolProvider<DirectionsArgs, DirectionsResponse> {
  private readonly logger = new Logger(DirectionsTool.name);

  constructor(
    private readonly chatEventEmitter: ChatEventEmitter,
    private readonly config: ConfigService,
    @Inject(HTTP_CLIENT) private readonly httpClient: AxiosInstance,
  ) {
    super({
      name: 'directions',
      description: 'Get directions between two or more locations and optional including waypoints',
      parameters: directionsSchema,
    });
  }

  async execute(
    args: DirectionsArgs,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<DirectionsResponse> {
    const { start, destination, waypoints = [] } = args;

    this.emitToolStartCallEvent(this.chatEventEmitter, {
      userId: context.userId,
      chatId: context.chatId,
      toolInfo: `From ${start} to ${destination} with waypoints: ${waypoints.join(', ')}`,
    });

    return await getGoogleMapsDirections(start, destination, waypoints);
  }
}

interface DirectionsResult {
  url: string | null;
  message: string | null;
  error?: string;
}

async function getGoogleMapsDirections(
  origin: string,
  destination: string,
  waypoints = [],
): Promise<DirectionsResult> {
  try {
    // URL encode the origin and destination
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);

    // Create a Google Maps URL with the route
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;

    // Add waypoints if provided
    if (waypoints.length > 0) {
      const encodedWaypoints = waypoints.map((wp) => encodeURIComponent(wp)).join('|');
      mapsUrl += `&waypoints=${encodedWaypoints}`;
    }

    const waypointsStr = waypoints.length > 0 ? ` via ${waypoints.join(', ')}` : '';
    const result = {
      url: mapsUrl,
      message: `Here's a Google Maps link with the route from ${origin} to ${destination}${waypointsStr}: ${mapsUrl}`,
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return result;
  } catch (e: any) {
    console.error(`Error in getGoogleMapsDirections: ${e.message}`);
    return {
      url: null,
      message: null,
      error: `An error occurred: ${e.message}`,
    };
  }
}
