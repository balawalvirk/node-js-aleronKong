import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ProductModule } from 'src/product/product.module';
import { UsersModule } from 'src/users/users.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ProductModule, UsersModule, OrderModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
