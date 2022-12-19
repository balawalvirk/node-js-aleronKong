import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from './sale.schema';
import { SaleService } from './sale.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }])],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
