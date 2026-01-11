import { Test, TestingModule } from '@nestjs/testing';
import { TestCryptoController } from './user.controller';

describe('TestCryptoController', () => {
  let controller: TestCryptoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestCryptoController],
    }).compile();

    controller = module.get<TestCryptoController>(TestCryptoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
