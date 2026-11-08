import { Controller, Get } from "@nestjs/common";
import { FeatureService } from "./services/featuer.service";

@Controller()
export class FeatureController {
    constructor(private readonly featureService: FeatureService){}

    // get all features
    @Get()
    findAll(){
        return this.featureService.findAll()
    }

}