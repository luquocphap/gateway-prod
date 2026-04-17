import { IsEmpty, IsNotEmpty, IsString } from "class-validator";

export class disableDto{
    @IsNotEmpty()
    @IsString()
    token: string
}