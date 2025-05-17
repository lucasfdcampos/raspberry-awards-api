import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { Movie } from './entities/movie.entity';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const mockMovies: Movie[] = [
        {
          id: 1,
          year: 1985,
          title: 'Rocky IV',
          producers: 'Irwin Winkler and Robert Chartoff',
          studios: 'MGM',
          winner: false,
        },
        {
          id: 2,
          year: 1990,
          title: 'Ghost',
          producers: 'Lisa Weinstein',
          studios: 'Paramount',
          winner: true,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockMovies);

      const result = await controller.findAll();

      expect(result).toEqual(mockMovies);
    });
  });
});
