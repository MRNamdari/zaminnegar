import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginWithPasswordCommand } from '../commands/auth.commands';
import { LoginResponseDto, UserResponseDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { InvalidCredentialsError } from '../errors';
import { PasswordService } from '../services/password.service';
import { SessionService } from '../services/session.service';

@CommandHandler(LoginWithPasswordCommand)
export class LoginWithPasswordHandler implements ICommandHandler<LoginWithPasswordCommand, LoginResponseDto> {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  async execute({ email, password, userAgent }: LoginWithPasswordCommand): Promise<LoginResponseDto> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
    // Phone-only users have no hash: `verify` then runs against a decoy, so timing does not reveal the difference.
    const valid = await this.passwords.verify(password, user?.passwordHash);
    if (!user || !valid || !user.isActive) throw new InvalidCredentialsError();

    const { token, expiresAt } = await this.sessions.create(user.id, userAgent);
    return { token, expiresAt, user: UserResponseDto.from(user) };
  }
}
