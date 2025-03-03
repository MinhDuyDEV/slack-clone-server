import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { SectionRepository } from '../repositories/section.repository';
import { CreateSectionDto, UpdateSectionDto } from '../dto';
import { Section } from '../entities/section.entity';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';
import { ISectionService } from 'src/core/interfaces/services/section.service.interface';

@Injectable()
export class SectionsService implements ISectionService {
  constructor(
    private readonly sectionRepository: SectionRepository,
    @Inject(forwardRef(() => 'IWorkspaceService'))
    private readonly workspaceService?: IWorkspaceService,
  ) {}

  async create(
    createSectionDto: CreateSectionDto,
    userId: string,
  ): Promise<Section> {
    const {
      workspaceId,
      isDefault,
      name,
      isDirectMessages,
      userId: sectionUserId,
    } = createSectionDto;

    // Kiểm tra workspace có tồn tại không
    if (this.workspaceService) {
      try {
        await this.workspaceService.findById(workspaceId);
      } catch (error) {
        throw new NotFoundException(
          `Workspace with ID ${workspaceId} not found`,
        );
      }
    }

    // Lấy tất cả các section trong workspace
    const existingSections =
      await this.sectionRepository.findByWorkspaceId(workspaceId);

    // Kiểm tra tên section không được trùng trong cùng workspace
    // Ngoại trừ trường hợp section Direct Messages (mỗi người dùng có một section riêng)
    if (!isDirectMessages) {
      const sectionWithSameName = existingSections.find(
        (section) => section.name.toLowerCase() === name.toLowerCase(),
      );

      if (sectionWithSameName) {
        throw new ConflictException(
          `A section with the name "${name}" already exists in this workspace`,
        );
      }
    } else if (isDirectMessages && sectionUserId) {
      // Kiểm tra xem người dùng đã có section Direct Messages trong workspace này chưa
      const userDMSection = existingSections.find(
        (section) =>
          section.isDirectMessages && section.userId === sectionUserId,
      );

      if (userDMSection) {
        throw new ConflictException(
          `User with ID ${sectionUserId} already has a Direct Messages section in this workspace`,
        );
      }
    }

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
    // Sử dụng khoảng cách 10000 giữa các section
    const highestOrder =
      existingSections.length > 0
        ? Math.max(...existingSections.map((section) => section.order))
        : 0;

    // Nếu đây là section đầu tiên, đặt order = 10000
    // Nếu không, đặt order = highestOrder + 10000
    const newOrder =
      existingSections.length === 0 ? 10000 : highestOrder + 10000;

    const sectionData = {
      ...createSectionDto,
      createdBy: userId,
      order: newOrder,
      settings: createSectionDto.settings || {
        isCollapsed: false,
        isPrivate: false,
      },
    };

    return this.sectionRepository.create(sectionData);
  }

  async findAll(workspaceId: string, userId?: string): Promise<Section[]> {
    if (userId) {
      // Nếu có userId, trả về tất cả các section không phải DM và các section DM của user đó
      const sections =
        await this.sectionRepository.findByWorkspaceId(workspaceId);
      return sections.filter(
        (section) =>
          !section.isDirectMessages ||
          (section.isDirectMessages && section.userId === userId),
      );
    }

    // Nếu không có userId, trả về tất cả các section
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

    // Kiểm tra tên section không được trùng trong cùng workspace khi cập nhật tên
    if (updateSectionDto.name) {
      const existingSections = await this.sectionRepository.findByWorkspaceId(
        section.workspaceId,
      );
      const sectionWithSameName = existingSections.find(
        (s) =>
          s.id !== id &&
          s.name.toLowerCase() === updateSectionDto.name.toLowerCase(),
      );

      if (sectionWithSameName) {
        throw new ConflictException(
          `A section with the name "${updateSectionDto.name}" already exists in this workspace`,
        );
      }
    }

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
    // Sử dụng khoảng cách 10000 giữa các section
    const updates = sectionIds.map((id, index) => {
      const section = sectionMap.get(id);
      section.order = (index + 1) * 10000; // Bắt đầu từ 10000, 20000, 30000, ...
      return section;
    });

    return this.sectionRepository.saveMany(updates);
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
      const sectionData = {
        name: 'General',
        workspaceId,
        isDefault: true,
        order: 0,
        createdBy: 'system', // This should be replaced with an actual user ID in production
        settings: {
          isCollapsed: false,
          isPrivate: false,
        },
      };

      return this.sectionRepository.create(sectionData);
    }

    return defaultSection;
  }

  /**
   * Chèn một section vào giữa hai section khác
   * @param workspaceId ID của workspace
   * @param createSectionDto Dữ liệu section mới
   * @param userId ID của người tạo
   * @param beforeSectionId ID của section đứng trước (nếu null, section mới sẽ được đặt ở đầu)
   * @param afterSectionId ID của section đứng sau (nếu null, section mới sẽ được đặt ở cuối)
   * @returns Section mới được tạo
   */
  async insertBetween(
    workspaceId: string,
    createSectionDto: CreateSectionDto,
    userId: string,
    beforeSectionId?: string,
    afterSectionId?: string,
  ): Promise<Section> {
    const { name, isDefault } = createSectionDto;

    // Kiểm tra workspace có tồn tại không
    if (this.workspaceService) {
      try {
        await this.workspaceService.findById(workspaceId);
      } catch (error) {
        throw new NotFoundException(
          `Workspace with ID ${workspaceId} not found`,
        );
      }
    }

    // Kiểm tra tên section không được trùng trong cùng workspace
    const existingSections =
      await this.sectionRepository.findByWorkspaceId(workspaceId);
    const sectionWithSameName = existingSections.find(
      (section) => section.name.toLowerCase() === name.toLowerCase(),
    );

    if (sectionWithSameName) {
      throw new ConflictException(
        `A section with the name "${name}" already exists in this workspace`,
      );
    }

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

    let newOrder: number;

    // Tính toán order mới dựa trên beforeSectionId và afterSectionId
    if (!beforeSectionId && !afterSectionId) {
      // Nếu không có section trước và sau, đặt ở cuối
      const highestOrder =
        existingSections.length > 0
          ? Math.max(...existingSections.map((section) => section.order))
          : 0;
      newOrder = existingSections.length === 0 ? 10000 : highestOrder + 10000;
    } else if (!beforeSectionId) {
      // Nếu không có section trước, đặt ở đầu
      const lowestOrder =
        existingSections.length > 0
          ? Math.min(...existingSections.map((section) => section.order))
          : 10000;
      newOrder = lowestOrder / 2; // Đặt ở vị trí trước section đầu tiên
    } else if (!afterSectionId) {
      // Nếu không có section sau, đặt ở cuối
      const highestOrder =
        existingSections.length > 0
          ? Math.max(...existingSections.map((section) => section.order))
          : 0;
      newOrder = highestOrder + 10000;
    } else {
      // Nếu có cả section trước và sau, đặt ở giữa
      const beforeSection = existingSections.find(
        (section) => section.id === beforeSectionId,
      );
      const afterSection = existingSections.find(
        (section) => section.id === afterSectionId,
      );

      if (!beforeSection || !afterSection) {
        throw new NotFoundException(
          'One or both of the specified sections not found',
        );
      }

      // Tính toán order mới là trung bình của hai section
      newOrder = Math.floor((beforeSection.order + afterSection.order) / 2);

      // Kiểm tra nếu không có đủ khoảng trống giữa hai section
      if (newOrder === beforeSection.order || newOrder === afterSection.order) {
        // Cần reorder lại tất cả các section
        const sortedSections = [...existingSections].sort(
          (a, b) => a.order - b.order,
        );
        const updates = sortedSections.map((section, index) => {
          section.order = (index + 1) * 10000;
          return section;
        });
        await this.sectionRepository.saveMany(updates);

        // Tính toán lại order mới sau khi reorder
        const reorderedSections =
          await this.sectionRepository.findByWorkspaceId(workspaceId);
        const newBeforeSection = reorderedSections.find(
          (section) => section.id === beforeSectionId,
        );
        const newAfterSection = reorderedSections.find(
          (section) => section.id === afterSectionId,
        );
        newOrder = Math.floor(
          (newBeforeSection.order + newAfterSection.order) / 2,
        );
      }
    }

    const sectionData = {
      ...createSectionDto,
      workspaceId,
      createdBy: userId,
      order: newOrder,
      settings: createSectionDto.settings || {
        isCollapsed: false,
        isPrivate: false,
      },
    };

    return this.sectionRepository.create(sectionData);
  }
}
