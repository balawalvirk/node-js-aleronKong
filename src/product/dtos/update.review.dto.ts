import { PartialType } from '@nestjs/mapped-types';
import { CreateProductCategoryDto } from './create-category.dto';
import {CreateReviewDto} from "src/product/dtos/create-review.dto";

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
