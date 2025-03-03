import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  forwardRef,
} from '@nestjs/common';
import { IChannelService } from 'src/core/interfaces/services/channel.service.interface';
import { IChannelRepository } from 'src/core/interfaces/repositories/channel.repository.interface';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';
import { ChannelType } from 'src/core/enums';

@Injectable()
export class ChannelsService implements IChannelService {
  constructor(
    @Inject('IChannelRepository')
    private readonly channelRepository: IChannelRepository,
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject(forwardRef(() => 'IWorkspaceService'))
    private readonly workspaceService?: IWorkspaceService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    // Kiểm tra workspace có tồn tại không
    const workspace = await this.workspaceService.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    // Kiểm tra tên channel không được trùng trong cùng workspace
    const existingChannels =
      await this.channelRepository.findByWorkspace(workspaceId);
    const channelWithSameName = existingChannels.find(
      (channel) =>
        channel.name.toLowerCase() === createChannelDto.name.toLowerCase(),
    );

    if (channelWithSameName) {
      throw new ConflictException(
        `A channel with the name "${createChannelDto.name}" already exists in this workspace`,
      );
    }

    // Xử lý trường hợp không có sectionId
    if (!createChannelDto.sectionId) {
      const defaultSection = workspace.sections.find(
        (section) => section.isDefault,
      );

      if (defaultSection) {
        createChannelDto.sectionId = defaultSection.id;
      } else if (workspace.sections && workspace.sections.length > 0) {
        createChannelDto.sectionId = workspace.sections[0].id;
      } else {
        throw new NotFoundException(
          'No sections found in this workspace. Please create a section first.',
        );
      }
    } else {
      // Kiểm tra section có tồn tại trong workspace này không
      const sectionExists = workspace.sections.some(
        (section) => section.id === createChannelDto.sectionId,
      );

      if (!sectionExists) {
        throw new NotFoundException(
          `Section with ID ${createChannelDto.sectionId} not found in this workspace`,
        );
      }
    }

    // Đảm bảo type có giá trị mặc định là PUBLIC nếu không được cung cấp
    if (!createChannelDto.type) {
      createChannelDto.type = ChannelType.PUBLIC;
    }

    const channel = await this.channelRepository.create({
      ...createChannelDto,
      workspaceId,
      createdBy: userId,
    });

    const creator = await this.userService.findById(userId);
    await this.channelRepository.addMember(channel.id, {
      userId: creator.id,
      role: 'admin',
      joinedAt: new Date(),
    });

    return channel;
  }

  async findById(id: string): Promise<Channel> {
    const channel = await this.channelRepository.findById(id);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  async findByWorkspace(workspaceId: string): Promise<Channel[]> {
    return this.channelRepository.findByWorkspace(workspaceId);
  }

  async findUserChannels(
    workspaceId: string,
    userId: string,
  ): Promise<Channel[]> {
    return this.channelRepository.findUserChannels(workspaceId, userId);
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    // Verify channel exists
    await this.findById(channelId);

    const user = await this.userService.findById(userId);
    const members = await this.getMembers(channelId);

    if (members.some((member) => member.id === userId)) {
      throw new ConflictException('User is already a member of this channel');
    }

    await this.channelRepository.addMember(channelId, {
      userId: user.id,
      role: 'member',
      joinedAt: new Date(),
    });
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    const channel = await this.findById(channelId);
    if (channel.createdBy === userId) {
      throw new ConflictException('Cannot remove channel creator');
    }

    const members = await this.getMembers(channelId);
    if (!members.some((member) => member.id === userId)) {
      throw new NotFoundException('User is not a member of this channel');
    }

    await this.channelRepository.removeMember(channelId, userId);
  }

  async getMembers(channelId: string): Promise<User[]> {
    return this.channelRepository.getMembers(channelId);
  }

  async update(
    channelId: string,
    data: Partial<CreateChannelDto>,
  ): Promise<Channel> {
    const channel = await this.findById(channelId);

    // Kiểm tra tên channel không được trùng trong cùng workspace khi cập nhật tên
    if (data.name) {
      const existingChannels = await this.channelRepository.findByWorkspace(
        channel.workspaceId,
      );
      const channelWithSameName = existingChannels.find(
        (c) =>
          c.id !== channelId &&
          c.name.toLowerCase() === data.name.toLowerCase(),
      );

      if (channelWithSameName) {
        throw new ConflictException(
          `A channel with the name "${data.name}" already exists in this workspace`,
        );
      }
    }

    // Kiểm tra section có tồn tại trong workspace này không khi cập nhật sectionId
    if (data.sectionId) {
      const workspace = await this.workspaceService.findById(
        channel.workspaceId,
      );
      const sectionExists = workspace.sections.some(
        (section) => section.id === data.sectionId,
      );

      if (!sectionExists) {
        throw new NotFoundException(
          `Section with ID ${data.sectionId} not found in this workspace`,
        );
      }
    }

    // Đảm bảo type không thay đổi nếu là DIRECT channel
    if (
      channel.type === ChannelType.DIRECT &&
      data.type &&
      data.type !== ChannelType.DIRECT
    ) {
      // Không cho phép thay đổi type của DIRECT channel
      delete data.type;
    }

    return this.channelRepository.update(channelId, data);
  }

  async delete(channelId: string): Promise<void> {
    await this.findById(channelId);
    await this.channelRepository.delete(channelId);
  }

  /**
   * Tạo kênh Direct Message giữa người dùng hiện tại và một hoặc nhiều người dùng khác
   * @param workspaceId ID của workspace
   * @param currentUserId ID của người dùng hiện tại
   * @param targetUserIds Danh sách ID của những người dùng khác trong cuộc trò chuyện
   * @param sectionId ID của section Direct Messages (nếu không cung cấp, sẽ tìm section DM của người dùng hiện tại)
   * @returns Channel đã tạo
   */
  async createDirectMessageChannel(
    workspaceId: string,
    currentUserId: string,
    targetUserIds: string[],
    sectionId?: string,
  ): Promise<Channel> {
    // Kiểm tra workspace có tồn tại không
    const workspace = await this.workspaceService.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    // Nếu không cung cấp sectionId, tìm section Direct Messages của người dùng hiện tại
    if (!sectionId) {
      const userSections = workspace.sections.filter(
        (section) =>
          section.isDirectMessages && section.userId === currentUserId,
      );

      if (userSections.length === 0) {
        throw new NotFoundException(
          `No Direct Messages section found for user ${currentUserId}`,
        );
      }

      sectionId = userSections[0].id;
    }

    // Kiểm tra section có tồn tại và có phải là section Direct Messages không
    const dmSection = workspace.sections.find(
      (section) => section.id === sectionId && section.isDirectMessages,
    );

    if (!dmSection) {
      throw new NotFoundException(
        `Section with ID ${sectionId} is not a Direct Messages section`,
      );
    }

    // Kiểm tra section có thuộc về người dùng hiện tại không
    if (dmSection.userId !== currentUserId) {
      throw new ConflictException(
        `Section with ID ${sectionId} does not belong to user ${currentUserId}`,
      );
    }

    // Kiểm tra tất cả người dùng đích có tồn tại không
    const allUserIds = [currentUserId, ...targetUserIds];
    const uniqueUserIds = [...new Set(allUserIds)]; // Loại bỏ các ID trùng lặp

    // Lấy thông tin người dùng và kênh DM hiện có song song
    const [users, existingChannels] = await Promise.all([
      // Lấy thông tin của tất cả người dùng
      Promise.all(
        uniqueUserIds.map(async (id) => {
          try {
            return await this.userService.findById(id);
          } catch (error) {
            throw new NotFoundException(`User with ID ${id} not found`);
          }
        }),
      ),
      // Lấy danh sách kênh trong workspace
      this.channelRepository.findByWorkspace(workspaceId),
    ]);

    // Tạo tên cho kênh DM dựa trên tên của các thành viên
    let channelName: string;
    if (
      uniqueUserIds.length === 1 ||
      (uniqueUserIds.length === 2 && uniqueUserIds[0] === uniqueUserIds[1])
    ) {
      // Trường hợp self DM (chỉ có 1 người dùng hoặc 2 người dùng nhưng là cùng một người)
      const user = users[0];
      channelName = `${user.displayName || user.username} (you)`;
    } else if (users.length === 2) {
      // Nếu chỉ có 2 người (current user và 1 người khác), lấy tên của người kia
      const otherUser = users.find((user) => user.id !== currentUserId);
      channelName = otherUser.displayName || otherUser.username;
    } else {
      // Nếu có nhiều người, ghép tên của tất cả (trừ current user)
      const otherUsers = users.filter((user) => user.id !== currentUserId);
      channelName = otherUsers
        .map((user) => user.displayName || user.username)
        .join(', ');
    }

    // Lọc các kênh DM trong section
    const dmChannels = existingChannels.filter(
      (channel) =>
        channel.type === ChannelType.DIRECT && channel.sectionId === sectionId,
    );

    // Lấy thành viên của tất cả các kênh DM
    const channelMembers = await Promise.all(
      dmChannels.map(async (channel) => {
        const members = await this.getMembers(channel.id);
        return {
          channelId: channel.id,
          memberIds: members.map((member) => member.id),
        };
      }),
    );

    // Kiểm tra xem đã có kênh DM nào có đúng những thành viên này chưa
    const existingChannel = channelMembers.find((channel) => {
      const memberIds = channel.memberIds;
      return (
        memberIds.length === uniqueUserIds.length &&
        uniqueUserIds.every((id) => memberIds.includes(id))
      );
    });

    if (existingChannel) {
      // Nếu đã có kênh DM, trả về kênh đó
      return this.findById(existingChannel.channelId);
    }

    // Tạo mô tả cho kênh
    let description: string;
    if (
      uniqueUserIds.length === 1 ||
      (uniqueUserIds.length === 2 && uniqueUserIds[0] === uniqueUserIds[1])
    ) {
      // Trường hợp self DM
      description = `Your personal space for notes and reminders`;
    } else {
      description = `Direct message between ${users.map((user) => user.username).join(', ')}`;
    }

    // Tạo kênh DM mới
    const channel = await this.channelRepository.create({
      name: channelName,
      description: description,
      type: ChannelType.DIRECT,
      sectionId,
      workspaceId,
      createdBy: currentUserId,
    });

    // Thêm tất cả người dùng vào kênh song song
    await Promise.all(
      uniqueUserIds.map((userId) =>
        this.channelRepository.addMember(channel.id, {
          userId,
          role: 'member',
          joinedAt: new Date(),
        }),
      ),
    );

    return channel;
  }

  /**
   * Kiểm tra xem người dùng có phải là thành viên của kênh không
   * @param channelId ID của kênh
   * @param userId ID của người dùng
   * @returns true nếu người dùng là thành viên, false nếu không
   */
  async isMember(channelId: string, userId: string): Promise<boolean> {
    const members = await this.getMembers(channelId);
    return members.some((member) => member.id === userId);
  }
}
