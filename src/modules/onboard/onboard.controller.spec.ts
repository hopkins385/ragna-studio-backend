import { Test, TestingModule } from '@nestjs/testing';
import { OnboardController } from './onboard.controller';
import { OnboardService } from './onboard.service';

describe('OnboardController', () => {
  let controller: OnboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardController],
      providers: [OnboardService],
    }).compile();

    controller = module.get<OnboardController>(OnboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
