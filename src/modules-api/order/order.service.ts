import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Users } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE } from 'src/common/constant/rabbitmq.constant';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class OrderService {
  constructor(@Inject(ORDER_SERVICE) private client: ClientProxy) {}
  async create(createOrderDto: CreateOrderDto, user: Users) {
    console.log({user, createOrderDto})
    const data = { userId: user.id, foodId: createOrderDto.foodId}

    const result = await lastValueFrom(this.client.send("createOrder", data))
    return result;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
