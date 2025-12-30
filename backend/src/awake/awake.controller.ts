import { Controller, Post, Headers, ForbiddenException } from "@nestjs/common";
import { AwakeService } from "./awake.service";

@Controller("awake")
export class AwakeController {
  constructor(private readonly awakeService: AwakeService) {}
  @Post("/")
  awake(@Headers("api-key") apiKey: string) {
    const reqApiKey = process.env.CRON_JOB_API_KEY;
    if (!reqApiKey || !apiKey || reqApiKey !== apiKey) {
      throw new ForbiddenException("Unauthorized");
    }
    return this.awakeService.awakeServer();
  }
}