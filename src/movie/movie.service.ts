import { Injectable, OnModuleInit } from '@nestjs/common';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { AwardIntervalResult } from './dto/award-interval.dto';
import { ProducerInterval } from './dto/producer-interval.dto';

interface CsvRow {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner?: string;
}

interface MovieByProducer {
  year: number;
  producer: string;
}

@Injectable()
export class MovieService implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Loads the movie data from the CSV file into the database.
   *
   * @returns {Promise<void>}
   */
  async onModuleInit(): Promise<void> {
    await this.loadCSV();
  }

  /**
   * Loads the movie data from the CSV file defined in the environment variable `CSV_PATH`.
   * Parses the CSV using fast-csv and saves the data to the database using TypeORM.
   *
   * @throws {Error} If the CSV path is not defined or if the database save fails
   * @returns {Promise<void>} Resolves when data is fully loaded and saved
   */
  private async loadCSV(): Promise<void> {
    const relativePath = this.configService.get<string>('CSV_PATH');
    if (!relativePath) {
      throw new Error('CSV_PATH not defined on .env');
    }

    const stream = fs.createReadStream(relativePath);
    const movies: Movie[] = [];

    return new Promise<void>((resolve) => {
      csv
        .parseStream<CsvRow, CsvRow>(stream, {
          headers: true,
          delimiter: ';',
          ignoreEmpty: true,
          trim: true,
        })
        .on('data', (row: CsvRow) => {
          const movie = new Movie();
          movie.year = parseInt(row.year);
          movie.title = row.title;
          movie.studios = row.studios;
          movie.producers = row.producers;
          movie.winner = row.winner?.toLowerCase() == 'yes';

          movies.push(movie);
        })
        .on('end', () => {
          this.movieRepository
            .save(movies)
            .then(() => {
              console.log(`CSV loaded: ${movies.length} movies saved`);
              resolve();
            })
            .catch((error) => {
              console.log('Error saving movies:', error);
            });
        });
    });
  }

  /**
   * Retrieves all movies from the database.
   *
   * @returns {Promise<Movie[]>} List of all movies
   */
  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find();
  }

  /**
   * Calculates the award intervals for producers who have won more than once.
   *
   * @returns {Promise<AwardIntervalResult>} Object containing producers with
   * the shortest and longest intervals between wins
   */
  async getAwardIntervals(): Promise<AwardIntervalResult> {
    const movies = await this.getMovieListWinners();
    const moviesByProducers = this.getMoviesByProducers(movies);
    const producerMap = this.groupYearByProducer(moviesByProducers);
    const intervals = this.getProducerIntervals(producerMap);
    const groupedIntervals = this.groupByInterval(intervals);
    return this.getMinAndMaxGroupedIntervals(groupedIntervals);
  }

  /**
   * Retrieves all movies that are marked as winners.
   *
   * @returns {Promise<Movie[]>} List of winning movies
   */
  private async getMovieListWinners(): Promise<Movie[]> {
    return this.movieRepository.find({ where: { winner: true } });
  }

  /**
   * Maps each producer to the years they won, based on the provided movies.
   *
   * @param {Movie[]} movies List of winning movies
   * @returns {MovieByProducer[]} List of objects containing producer and year of win
   */
  private getMoviesByProducers(movies: Movie[]): MovieByProducer[] {
    return movies.flatMap((movie) =>
      this.splitProducerNames(movie.producers).map((producer) => {
        return { year: movie.year, producer };
      }),
    );
  }

  /**
   * Splits a string of producer names into an array, handling different separators.
   *
   * @param {string} input String containing producer names
   * @returns {string[]} Array of producer names
   */
  private splitProducerNames(input: string): string[] {
    return input
      .replace(/ and /g, ',') // Troca o " and " por vírgula
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * Groups years by producer.
   *
   * @param {MovieByProducer[]} entries List of producer-year objects
   * @returns {Record<string, number[]>} Map of producer to list of winning years
   * Ex: A: [2000, 2002, 2010]
   */
  private groupYearByProducer(
    entries: MovieByProducer[],
  ): Record<string, number[]> {
    const map: Record<string, number[]> = {};

    for (const entry of entries) {
      if (!map[entry.producer]) {
        map[entry.producer] = [];
      }
      map[entry.producer].push(entry.year);
    }

    return map;
  }

  /**
   * Calculates the intervals between wins for each producer.
   * Ignoring those who have only 1 win.
   *
   * @param {Record<string, number[]>} producerYears Map of producer to winning years
   * @returns {ProducerInterval[]} List of intervals for each producer
   */
  private getProducerIntervals(
    producerYears: Record<string, number[]>,
  ): ProducerInterval[] {
    const result: ProducerInterval[] = [];

    Object.entries(producerYears).forEach(([producer, years]) => {
      if (years.length < 2) {
        return;
      }

      const orderedYears = years.sort((a, b) => a - b);

      orderedYears.forEach((year, index) => {
        const nextYear = orderedYears[index + 1];

        if (nextYear !== undefined) {
          result.push({
            producer,
            interval: nextYear - year,
            previousWin: year,
            followingWin: nextYear,
          });
        }
      });
    });

    return result;
  }

  /**
   * Groups producer intervals by the interval value.
   *
   * @param {ProducerInterval[]} intervals List of producer intervals
   * @returns {Record<number, ProducerInterval[]>} Map of interval value to list of producer intervals
   * Ex: 1: [{ producer: 'Joel Silver', ... }],
   */
  private groupByInterval(
    intervals: ProducerInterval[],
  ): Record<number, ProducerInterval[]> {
    const groups: Record<number, ProducerInterval[]> = {};

    for (const item of intervals) {
      const interval = item.interval;

      if (!groups[interval]) {
        groups[interval] = [];
      }
      groups[interval].push(item);
    }

    return groups;
  }

  /**
   * Returns the producers with the minimum and maximum award intervals.
   *
   * @param {Record<number, ProducerInterval[]>} grouped Map of intervals grouped by value
   * @returns {{ min: ProducerInterval[]; max: ProducerInterval[] }} Object with lists of producers with the shortest and longest intervals
   */
  private getMinAndMaxGroupedIntervals(
    grouped: Record<number, ProducerInterval[]>,
  ): {
    min: ProducerInterval[];
    max: ProducerInterval[];
  } {
    const ordered = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);

    return {
      min: grouped[ordered[0]] ?? [],
      max: grouped[ordered[ordered.length - 1]] ?? [],
    };
  }
}
