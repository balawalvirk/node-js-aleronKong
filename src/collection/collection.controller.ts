import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('create')
  async create(@Body() createCollectionDto: CreateCollectionDto, @GetUser() user: UserDocument) {
    return await this.collectionService.createRecord({ ...createCollectionDto, creator: user._id });
  }

  @Patch('add-product/:id/:productId')
  async addProduct(
    @Param('id', ParseObjectId) id: string,
    @Param('productId', ParseObjectId) productId: string
  ) {
    return await this.collectionService.findOneRecordAndUpdate(
      { _id: id },
      { $push: { products: productId } }
    );
  }

  // @Get()
  // findAll() {
  //   return this.collectionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.collectionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
  //   return this.collectionService.update(+id, updateCollectionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.collectionService.remove(+id);
  // }
}
