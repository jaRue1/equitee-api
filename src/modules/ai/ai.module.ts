import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CoursesModule } from '../courses/courses.module';
import { MentorsModule } from '../mentors/mentors.module';
import { YouthProgramsModule } from '../youth-programs/youth-programs.module';
import { DemographicsModule } from '../demographics/demographics.module';
import { AIController } from './ai.controller';
import { TestAIController } from './test-ai.controller';
import { AIService } from './ai.service';
import { AIAgentService } from './ai-agent.service';
import { CommunityToolsService } from './community-tools.service';

@Module({
  imports: [
    DatabaseModule,
    CoursesModule,
    MentorsModule,
    YouthProgramsModule,
    DemographicsModule,
  ],
  controllers: [AIController, TestAIController],
  providers: [AIService, AIAgentService, CommunityToolsService],
  exports: [AIService, AIAgentService],
})
export class AIModule {}