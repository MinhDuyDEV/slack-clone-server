import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Inject,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from 'src/modules/users/entities/user.entity';
import { IMessageService } from '../../../core/interfaces/services/message.service.interface';
import { MessageResponseDto } from '../dto/message-response.dto';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('channels/:channelId/messages')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MessagesController {
  constructor(
    @Inject('IMessageService')
    private readonly messagesService: IMessageService,
  ) {}

  @Post()
  async create(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MessageResponseDto> {
    // Set the channelId and userId from the route and authenticated user
    createMessageDto.channelId = channelId;
    createMessageDto.userId = req.user.id;

    const message = await this.messagesService.create(createMessageDto);
    return new MessageResponseDto(message);
  }

  @Get()
  async findAll(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.messagesService.findByChannel(channelId, {
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      before: before ? new Date(before) : undefined,
      after: after ? new Date(after) : undefined,
      parentId: null, // Only get main channel messages (not thread replies)
    });

    return messages.map((message) => new MessageResponseDto(message));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.findById(id);
    return new MessageResponseDto(message);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.update(
      id,
      req.user.id,
      updateMessageDto,
    );
    return new MessageResponseDto(message);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.messagesService.delete(id, req.user.id);
  }

  @Post(':id/reactions')
  async addReaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('emoji') emoji: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.addReaction(
      id,
      req.user.id,
      emoji,
    );
    return new MessageResponseDto(message);
  }

  @Delete(':id/reactions/:emoji')
  async removeReaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('emoji') emoji: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.removeReaction(
      id,
      req.user.id,
      emoji,
    );
    return new MessageResponseDto(message);
  }

  @Get(':id/thread')
  async getThreadReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.messagesService.getThreadReplies(id, {
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      before: before ? new Date(before) : undefined,
      after: after ? new Date(after) : undefined,
    });

    return messages.map((message) => new MessageResponseDto(message));
  }

  @Post(':id/thread')
  async replyToThread(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Param('id', ParseUUIDPipe) parentId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MessageResponseDto> {
    // Set the channelId, userId, and parentId
    createMessageDto.channelId = channelId;
    createMessageDto.userId = req.user.id;
    createMessageDto.parentId = parentId;

    const message = await this.messagesService.create(createMessageDto);
    return new MessageResponseDto(message);
  }
}
