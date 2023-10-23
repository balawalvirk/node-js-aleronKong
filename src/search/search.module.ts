import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { UsersModule } from 'src/users/users.module';
import { ProductModule } from 'src/product/product.module';
import { GroupModule } from 'src/group/group.module';
import { PackageModule } from 'src/package/package.module';
import {PageModule} from "src/page/page.module";

@Module({
  imports: [UsersModule, ProductModule, GroupModule, PackageModule,PageModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
