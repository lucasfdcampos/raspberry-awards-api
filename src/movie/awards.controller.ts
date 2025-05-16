import { Controller, Get } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('awards')
export class AwardsController {
  constructor(private readonly movieService: MovieService) {}

  @Get('intervals')
  getIntervals() {
    return 'awards/intervals';
  }
}
