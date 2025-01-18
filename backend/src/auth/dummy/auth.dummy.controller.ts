import { Controller, Get} from "@nestjs/common";

@Controller("events")

export class eventController{
    @Get("conf")
    eventData(){
        return {message: "confidential data is - RAW INTELLIGENCE is located in Geneva", level: 5}
    }
} 