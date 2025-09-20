import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'EquiTee API - Democratizing Golf Access in South Florida';
  }
}