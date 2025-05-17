import { Test, TestingModule } from '@nestjs/testing';
import { AwardsController } from './awards.controller';
import { MovieService } from './movie.service';
import { AwardIntervalResult } from './dto/award-interval.dto';

describe('AwardsController', () => {
  let controller: AwardsController;
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwardsController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            getAwardIntervals: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AwardsController>(AwardsController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIntervals', () => {
    it('should return min and max award intervals', async () => {
      const mockResult: AwardIntervalResult = {
        min: [
          {
            producer: 'Joel Silver',
            interval: 1,
            previousWin: 1990,
            followingWin: 1991,
          },
        ],
        max: [
          {
            producer: 'Matthew Vaughn',
            interval: 13,
            previousWin: 2002,
            followingWin: 2015,
          },
        ],
      };

      jest.spyOn(service, 'getAwardIntervals').mockResolvedValue(mockResult);

      const result = await controller.getIntervals();

      expect(result).toEqual(mockResult);
    });
  });
});
