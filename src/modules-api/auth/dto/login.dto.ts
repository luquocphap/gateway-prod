import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, isEmail, IsNotEmpty, IsOptional, IsString, isValidationOptions } from "class-validator";
export class LoginDto {
    @ApiProperty({example: "luphap@gmail.com"})
    @IsNotEmpty()
    @IsEmail(undefined, {message: "email error"})
    email: string;

    @ApiProperty({example: "Cavaba123456-"})
    @IsNotEmpty()
    password: string;

    @ApiProperty({example: "123456"})
    @IsOptional()
    @IsString()
    token?: string;

}