
import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'ROLE_KEY';
export const Role = (role: "ADMIN" | "USER" | "SUPPER_ADMIN") => SetMetadata(ROLE_KEY, role);
