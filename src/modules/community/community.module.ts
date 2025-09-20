import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CoursesModule } from '../courses/courses.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [DatabaseModule, CoursesModule],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}