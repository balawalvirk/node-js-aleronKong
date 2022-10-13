import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/create')
  async create(@Body() body: CreateProductDto, @GetUser() user: UserDocument) {
    return await this.productService.createRecord({ ...body, creator: user._id });
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.productService.deleteSingleRecord({ _id: id });
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return await this.productService.findOneRecordAndUpdate({ _id: id }, body);
  }

  @Get('/inventory')
  async inventory(@GetUser() user: UserDocument) {
    await this.productService.findAllRecords({ creator: user._id });
  }
}
