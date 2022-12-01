import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IUserEntity } from 'src/modules/user/interfaces/user.interface';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class UserPayloadPutToRequestGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user } = request;

        const check: IUserEntity =
            await this.userService.findOneById<IUserEntity>(user._id, {
                join: true,
            });
        request.__user = check;

        return true;
    }
}
