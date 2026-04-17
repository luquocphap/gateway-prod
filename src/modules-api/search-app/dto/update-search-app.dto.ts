import { PartialType } from '@nestjs/mapped-types';
import { CreateSearchAppDto } from './create-search-app.dto';

export class UpdateSearchAppDto extends PartialType(CreateSearchAppDto) {}
