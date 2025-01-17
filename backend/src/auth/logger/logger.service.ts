import { Injectable } from "@nestjs/common";
import { Log } from "../dto";

@Injectable()

export class LogInfoService{
    Logger(data: Log){
       const logEntry = {
            request: data.request, 
            source: data.source,
            timestamp: data.timestamp,
            queryParams: data.queryParams,
            bodyParams: data.bodyParams,
            response: data.response,
            error: data.error
        }
        console.info(logEntry)
    }
}