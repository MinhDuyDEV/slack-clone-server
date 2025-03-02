import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { ISectionRepository } from 'src/core/interfaces/repositories/section.repository.interface';
import { BaseRepository } from 'src/core/repositories/base.repository';

@Injectable()
export class SectionRepository
  extends BaseRepository<Section>
  implements ISectionRepository
{
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {
    super(sectionRepository);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Section[]> {
    return this.sectionRepository.find({
      where: { workspaceId },
      order: { order: 'ASC' },
      relations: ['channels'],
    });
  }

  async findById(id: string): Promise<Section> {
    return this.sectionRepository.findOne({
      where: { id },
      relations: ['channels', 'workspace'],
    });
  }

  async findDefaultByWorkspaceId(workspaceId: string): Promise<Section> {
    return this.sectionRepository.findOne({
      where: { workspaceId, isDefault: true },
    });
  }

  async save(section: Section): Promise<Section> {
    return this.sectionRepository.save(section);
  }

  async saveMany(sections: Section[]): Promise<Section[]> {
    return this.sectionRepository.save(sections);
  }

  async softDelete(id: string): Promise<void> {
    await this.sectionRepository.softDelete(id);
  }
}
