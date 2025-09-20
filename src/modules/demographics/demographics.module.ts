import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DemographicsController } from './demographics.controller';
import { DemographicsService } from './demographics.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DemographicsController],
  providers: [DemographicsService],
  exports: [DemographicsService],
})
export class DemographicsModule {}