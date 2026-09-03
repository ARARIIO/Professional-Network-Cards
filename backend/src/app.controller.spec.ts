import { Test } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  it('returns health', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    const controller = moduleRef.get(AppController);
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
