import { Section } from 'src/modules/sections/entities/section.entity';
import { CreateSectionDto, UpdateSectionDto } from 'src/modules/sections/dto';

export interface ISectionService {
  create(createSectionDto: CreateSectionDto, userId: string): Promise<Section>;
  findAll(workspaceId: string, userId?: string): Promise<Section[]>;
  findOne(id: string): Promise<Section>;
  update(id: string, updateSectionDto: UpdateSectionDto): Promise<Section>;
  remove(id: string): Promise<void>;
  reorder(workspaceId: string, sectionIds: string[]): Promise<Section[]>;
  getDefaultSection(workspaceId: string): Promise<Section>;
  insertBetween(
    workspaceId: string,
    createSectionDto: CreateSectionDto,
    userId: string,
    beforeSectionId?: string,
    afterSectionId?: string,
  ): Promise<Section>;
}
