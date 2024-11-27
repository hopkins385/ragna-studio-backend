import { Public } from '@/common/decorators/public.decorator';
import {
  BadRequestException,
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    // private readonly subscriptionService: SubscriptionService,
  ) {}

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      return this.stripeService.handleWebhook(signature, req.rawBody);
    } catch (error) {
      throw new InternalServerErrorException('Error handling webhook');
    }
  }
}
