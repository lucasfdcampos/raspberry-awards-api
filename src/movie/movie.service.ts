import { Injectable } from '@nestjs/common';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  findAll(): Movie[] {
    const movies: Movie[] = [];
    return movies;
  }
}
