import { Injectable, OnModuleInit } from '@nestjs/common';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as csv from 'fast-csv';

interface CsvRow {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner?: string;
}

@Injectable()
export class MovieService implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.loadCSV();
  }

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

  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find();
  }

  getAwardIntervals() {
    return 'getAwardIntervals';
  }
}
