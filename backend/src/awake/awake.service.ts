import { Injectable } from "@nestjs/common";
import { LogInfoService } from "src/auth/logger/logger.service";

@Injectable()
export class AwakeService {
    constructor(
        private logService: LogInfoService
    ){}
    awakeServer() {
        this.logService.Logger({request: "Awake Request", source: "awake server service -> awakeServer", timestamp: new Date(), queryParams: false, bodyParams: false, response: "awake", error: "none"});
        return { message: "Server activated successfully"};
    }
}