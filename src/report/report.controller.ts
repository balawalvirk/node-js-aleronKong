import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetUser, Roles } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { ReportDocument } from './report.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { UserRole } from 'src/types';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('create')
  async create(@Body() createReportDto: CreateReportDto, @GetUser() user: UserDocument) {
    const report: ReportDocument = await this.reportService.createRecord({
      ...createReportDto,
      reporter: user._id,
    });
    return { message: `${report.reportedGroup ? 'Group' : 'User'} reported successfully.` };
  }

  /**
   * TODO : need to change this later
   */
  // @Roles(UserRole.ADMIN)
  @Get('find-all')
  async findAll(@Query() query) {
    return await this.reportService.findAllRecords(query);
  }
}
