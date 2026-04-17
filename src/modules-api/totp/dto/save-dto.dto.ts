import { IsNotEmpty, IsString } from "class-validator";

export class saveTotpDto{
    @IsNotEmpty()
    @IsString()
    secret: string;

    @IsNotEmpty()
    @IsString()
    token: string;
}