import { Module } from '@nestjs/common';

import { BusinessServicesController } from './business-services.controller';
import { BusinessServicesService } from './business-services.service';

@Module({
    controllers: [BusinessServicesController],
    providers: [BusinessServicesService],
    exports: [BusinessServicesService],
})
export class BusinessServicesModule { }
