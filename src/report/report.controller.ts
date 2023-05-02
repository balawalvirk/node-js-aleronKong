import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetUser, Roles } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { ReportDocument } from './report.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { UserRoles } from 'src/types';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('create')
  async create(@Body() createReportDto: CreateReportDto, @GetUser() user: UserDocument) {
    return await this.reportService.createRecord({ ...createReportDto, reporter: user._id });
  }

  /**
   * TODO : need to change this later
   */
  // @Roles(UserRoles.ADMIN)
  @Get('find-all')
  async findAll(@Query() query) {
    return await this.reportService.findAllRecords(query);
  }
}
