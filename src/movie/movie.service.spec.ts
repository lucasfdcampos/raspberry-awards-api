import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ProducerInterval } from './dto/producer-interval.dto';

describe('MovieService', () => {
  let service: MovieService;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all movies from the repository', async () => {
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

      // Mocka o método find do repositório
      movieRepository.find.mockResolvedValue(mockMovies);

      const result = await service.findAll();

      expect(result).toEqual(mockMovies);
    });
  });

  describe('splitProducerNames', () => {
    it('should split by comma and "and"', () => {
      const input = 'Bob Cavallo, Joe Ruffalo and Steve Fargnoli';
      const result = service['splitProducerNames'](input);
      expect(result).toEqual(['Bob Cavallo', 'Joe Ruffalo', 'Steve Fargnoli']);
    });

    it('should trim whitespace and remove empty strings', () => {
      const input = ' Bob Cavallo, , Joe Ruffalo and Steve Fargnoli ';
      const result = service['splitProducerNames'](input);
      expect(result).toEqual(['Bob Cavallo', 'Joe Ruffalo', 'Steve Fargnoli']);
    });
  });

  describe('getMoviesByProducers', () => {
    it('should return multiple entries when a movie has multiple producers', () => {
      const movies: Movie[] = [
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
          year: 1985,
          title: 'Year of the Dragon',
          producers: 'Dino De Laurentiis',
          studios: 'MGM',
          winner: false,
        },
        {
          id: 3,
          year: 1985,
          title: 'Revolution',
          producers: 'Irwin Winkler',
          studios: 'Warner Bros.',
          winner: false,
        },
        {
          id: 4,
          year: 1986,
          title: 'Cobra',
          producers: 'Yoram Globus and Menahem Golan',
          studios: 'Warner Bros.',
          winner: false,
        },
      ];

      const result = service['getMoviesByProducers'](movies);

      expect(result).toEqual([
        { year: 1985, producer: 'Irwin Winkler' },
        { year: 1985, producer: 'Robert Chartoff' },
        { year: 1985, producer: 'Dino De Laurentiis' },
        { year: 1985, producer: 'Irwin Winkler' },
        { year: 1986, producer: 'Yoram Globus' },
        { year: 1986, producer: 'Menahem Golan' },
      ]);
    });
  });

  describe('groupYearByProducer', () => {
    it('should return years grouped by producers', () => {
      const entries = [
        { year: 1999, producer: 'A' },
        { year: 2000, producer: 'B' },
        { year: 2000, producer: 'C' },
        { year: 2001, producer: 'A' },
        { year: 2000, producer: 'B' },
      ];

      const result = service['groupYearByProducer'](entries);

      const expected = {
        A: [1999, 2001],
        B: [2000, 2000],
        C: [2000],
      };
      expect(result).toEqual(expected);
    });
  });

  describe('getProducerIntervals', () => {
    it('should calculate intervals between wins correctly', () => {
      const input = {
        A: [2000, 2002, 2005],
        B: [1995, 2000],
      };

      const result = service['getProducerIntervals'](input);

      expect(result).toEqual([
        { producer: 'A', interval: 2, previousWin: 2000, followingWin: 2002 },
        { producer: 'A', interval: 3, previousWin: 2002, followingWin: 2005 },
        { producer: 'B', interval: 5, previousWin: 1995, followingWin: 2000 },
      ]);
    });

    it('should return empty array for producers with less than 2 wins', () => {
      const producerYears = {
        A: [2005],
        B: [],
      };

      const result = service['getProducerIntervals'](producerYears);

      expect(result).toEqual([]);
    });
  });

  describe('groupByInterval', () => {
    it('should group intervals correctly by interval value', () => {
      const intervals: ProducerInterval[] = [
        { producer: 'A', interval: 2, previousWin: 2000, followingWin: 2002 },
        { producer: 'B', interval: 2, previousWin: 2010, followingWin: 2012 },
        { producer: 'C', interval: 5, previousWin: 1990, followingWin: 1995 },
      ];

      const result = service['groupByInterval'](intervals);

      expect(result).toEqual({
        2: [
          { producer: 'A', interval: 2, previousWin: 2000, followingWin: 2002 },
          { producer: 'B', interval: 2, previousWin: 2010, followingWin: 2012 },
        ],
        5: [
          { producer: 'C', interval: 5, previousWin: 1990, followingWin: 1995 },
        ],
      });
    });
  });

  describe('getMinAndMaxGroupedIntervals', () => {
    it('should return the min and max intervals correctly', () => {
      const intervals = {
        1: [
          {
            producer: 'Joel Silver',
            interval: 1,
            previousWin: 1990,
            followingWin: 1991,
          },
        ],
        13: [
          {
            producer: 'Matthew Vaughn',
            interval: 13,
            previousWin: 2002,
            followingWin: 12015995,
          },
        ],
      };

      const result = service['getMinAndMaxGroupedIntervals'](intervals);

      expect(result.min).toEqual(intervals[1]);
      expect(result.max).toEqual(intervals[13]);
    });
  });

  describe('getAwardIntervals', () => {
    it('should return correct min and max intervals', async () => {
      const movies: Movie[] = [
        {
          year: 2000,
          producers: 'A and B',
          winner: true,
          id: 1,
          title: '',
          studios: '',
        },
        {
          year: 2002,
          producers: 'A',
          winner: true,
          id: 2,
          title: '',
          studios: '',
        },
        {
          year: 2005,
          producers: 'A',
          winner: true,
          id: 3,
          title: '',
          studios: '',
        },
        {
          year: 2010,
          producers: 'B',
          winner: true,
          id: 4,
          title: '',
          studios: '',
        },
      ];

      movieRepository.find.mockResolvedValue(movies);

      const result = await service.getAwardIntervals();

      expect(result.min).toEqual([
        { producer: 'A', interval: 1, previousWin: 2000, followingWin: 2002 },
      ]);

      expect(result.max).toEqual([
        { producer: 'B', interval: 10, previousWin: 2000, followingWin: 2010 },
      ]);
    });
  });
});
