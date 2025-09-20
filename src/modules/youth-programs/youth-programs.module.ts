import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { YouthProgramsController } from './youth-programs.controller';
import { YouthProgramsService } from './youth-programs.service';

@Module({
  imports: [DatabaseModule],
  controllers: [YouthProgramsController],
  providers: [YouthProgramsService],
  exports: [YouthProgramsService],
})
export class YouthProgramsModule {}