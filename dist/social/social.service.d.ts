import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
export declare class SocialService {
    create(createSocialDto: CreateSocialDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateSocialDto: UpdateSocialDto): string;
    remove(id: number): string;
}
