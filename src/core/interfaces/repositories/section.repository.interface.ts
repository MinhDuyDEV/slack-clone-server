import { IBaseRepository } from './base.repository.interface';
import { Section } from 'src/modules/sections/entities/section.entity';

export interface ISectionRepository extends IBaseRepository<Section> {
  findByWorkspaceId(workspaceId: string): Promise<Section[]>;
  findById(id: string): Promise<Section>;
  findDefaultByWorkspaceId(workspaceId: string): Promise<Section>;
  save(section: Section): Promise<Section>;
  saveMany(sections: Section[]): Promise<Section[]>;
  softDelete(id: string): Promise<void>;
}
