import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsController } from './controllers/sections.controller';
import { SectionsService } from './services/sections.service';
import { SectionRepository } from './repositories/section.repository';
import { Section } from './entities/section.entity';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [SectionsController],
  providers: [
    SectionsService,
    SectionRepository,
    {
      provide: 'ISectionRepository',
      useClass: SectionRepository,
    },
    {
      provide: 'ISectionService',
      useClass: SectionsService,
    },
  ],
  exports: [
    SectionsService,
    SectionRepository,
    'ISectionRepository',
    'ISectionService',
  ],
})
export class SectionsModule {}
