import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
export declare class DashboardService {
    create(createDashboardDto: CreateDashboardDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateDashboardDto: UpdateDashboardDto): string;
    remove(id: number): string;
}
