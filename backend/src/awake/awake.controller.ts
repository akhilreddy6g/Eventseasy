import { Controller, Post } from "@nestjs/common";
import { AwakeService } from "./awake.service";

@Controller('awake')
export class AwakeController {
    constructor(private readonly awakeService: AwakeService) {}
    @Post('/')
    awake() {
        return this.awakeService.awakeServer();
    }
}