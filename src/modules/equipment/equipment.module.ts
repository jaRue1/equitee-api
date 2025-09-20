import { Module } from '@nestjs/common';
import { EquipmentService } from './services/equipment.service';
import { EquipmentController } from './equipment.controller';

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}