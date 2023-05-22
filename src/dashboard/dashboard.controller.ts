import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/helpers';
import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';
import { SaleService } from 'src/product/sale.service';
import { UserDocument } from 'src/users/users.schema';

@Controller()
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly saleService: SaleService
  ) {}

  @Get('user/dashboard')
  async SellerDashbaord(@GetUser() user: UserDocument) {
    const options = { sort: { createdAt: -1 }, limit: 10 };
    const [recentProducts, recentOrders, recentCustomers, totalProducts, totalOrders, totalCustomers] = await Promise.all([
      this.productService.find({ creator: user._id }, options),
      this.orderService.find({ seller: user._id }, options),
      this.saleService.findAllRecords({ seller: user._id }, options),
      this.productService.countRecords({ creator: user._id }),
      this.orderService.countRecords({ seller: user._id }),
      this.saleService.findAllRecords({ seller: user._id }),
    ]);
    return { totalCustomers: totalCustomers.length, totalOrders, totalProducts, recentProducts, recentCustomers, recentOrders };
  }
}
