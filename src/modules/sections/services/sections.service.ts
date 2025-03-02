import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SectionRepository } from '../repositories/section.repository';
import { CreateSectionDto, UpdateSectionDto } from '../dto';
import { Section } from '../entities/section.entity';

@Injectable()
export class SectionsService {
  constructor(private readonly sectionRepository: SectionRepository) {}

  async create(
    createSectionDto: CreateSectionDto,
    userId: string,
  ): Promise<Section> {
    const { workspaceId, isDefault } = createSectionDto;

    // If this is the default section, check if there's already a default one
    if (isDefault) {
      const existingDefault =
        await this.sectionRepository.findDefaultByWorkspaceId(workspaceId);
      if (existingDefault) {
        throw new BadRequestException(
          'A default section already exists for this workspace',
        );
      }
    }

    // Get the highest order to place the new section at the end
    const existingSections =
      await this.sectionRepository.findByWorkspaceId(workspaceId);
    const highestOrder =
      existingSections.length > 0
        ? Math.max(...existingSections.map((section) => section.order))
        : -1;

    const section = this.sectionRepository.create({
      ...createSectionDto,
      createdBy: userId,
      order: highestOrder + 1,
      settings: createSectionDto.settings || {
        isCollapsed: false,
        isPrivate: false,
      },
    });

    return this.sectionRepository.save(section);
  }

  async findAll(workspaceId: string): Promise<Section[]> {
    return this.sectionRepository.findByWorkspaceId(workspaceId);
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.sectionRepository.findById(id);
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return section;
  }

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const section = await this.findOne(id);

    // If setting this section as default, unset any existing default
    if (updateSectionDto.isDefault) {
      const existingDefault =
        await this.sectionRepository.findDefaultByWorkspaceId(
          section.workspaceId,
        );
      if (existingDefault && existingDefault.id !== id) {
        existingDefault.isDefault = false;
        await this.sectionRepository.save(existingDefault);
      }
    }

    // Update the section
    Object.assign(section, updateSectionDto);

    // Merge settings
    if (updateSectionDto.settings) {
      section.settings = {
        ...section.settings,
        ...updateSectionDto.settings,
      };
    }

    return this.sectionRepository.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);

    // Check if this is the default section
    if (section.isDefault) {
      throw new BadRequestException('Cannot delete the default section');
    }

    // Check if the section has channels
    if (section.channels && section.channels.length > 0) {
      throw new BadRequestException(
        'Cannot delete a section that contains channels',
      );
    }

    await this.sectionRepository.softDelete(id);
  }

  async reorder(workspaceId: string, sectionIds: string[]): Promise<Section[]> {
    const sections =
      await this.sectionRepository.findByWorkspaceId(workspaceId);

    // Validate that all sections exist and belong to the workspace
    const sectionMap = new Map(
      sections.map((section) => [section.id, section]),
    );
    for (const id of sectionIds) {
      if (!sectionMap.has(id)) {
        throw new NotFoundException(
          `Section with ID ${id} not found in workspace`,
        );
      }
    }

    // Update the order of each section
    const updates = sectionIds.map((id, index) => {
      const section = sectionMap.get(id);
      section.order = index;
      return section;
    });

    return this.sectionRepository.save(updates);
  }

  async getDefaultSection(workspaceId: string): Promise<Section> {
    // Find the default section
    const defaultSection =
      await this.sectionRepository.findDefaultByWorkspaceId(workspaceId);

    // If no default section exists, get the first section or create a new one
    if (!defaultSection) {
      const sections =
        await this.sectionRepository.findByWorkspaceId(workspaceId);
      if (sections.length > 0) {
        return sections[0];
      }

      // Create a default section
      const newSection = this.sectionRepository.create({
        name: 'General',
        workspaceId,
        isDefault: true,
        order: 0,
        createdBy: 'system', // This should be replaced with an actual user ID in production
        settings: {
          isCollapsed: false,
          isPrivate: false,
        },
      });

      return this.sectionRepository.save(newSection);
    }

    return defaultSection;
  }
}
