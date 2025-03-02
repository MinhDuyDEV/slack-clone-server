import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Section } from '../entities/section.entity';

@Injectable()
export class SectionRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }

  async findByWorkspaceId(workspaceId: string): Promise<Section[]> {
    return this.find({
      where: { workspaceId },
      order: { order: 'ASC' },
      relations: ['channels'],
    });
  }

  async findById(id: string): Promise<Section> {
    return this.findOne({
      where: { id },
      relations: ['channels', 'workspace'],
    });
  }

  async findDefaultByWorkspaceId(workspaceId: string): Promise<Section> {
    return this.findOne({
      where: { workspaceId, isDefault: true },
    });
  }
}
