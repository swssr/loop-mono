import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export interface User {
  _id: string;
  fullname?: string;
  email?: string;
  password?: string;
  validatePassword?: (password: string) => Promise<boolean>;
  generateAuthToken?: () => Promise<string>;
  weights?: {
    timestamp: string;
    value: number;
  }[];
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true },
  fullname: { type: String, required: true },
  weights: { type: [], required: true },
  password: { type: String, required: true },
});

UserSchema.pre('save', async function (next: any) {
  const _user = this as User;

  if (!this.isModified('password')) return next();

  try {
    _user.password = await bcrypt.hash(this.password, SALT_ROUNDS);

    return next();
  } catch (e) {
    return next(e);
  }
});

//Methods
UserSchema.methods.validatePassword = async function (password: string) {
  console.log('Inside validate password');
  return await bcrypt.compare(password, this.password);
};

const KEY = 'Vdz7>K@W!5}pknh';

UserSchema.methods.generateAuthToken = async function () {
  const user = this as User;

  const token = jwt.sign(
    { uid: user._id },
    process.env.JWT_ACCESS_TOKEN || KEY,
    {
      expiresIn: '5h',
    }
  );

  return token;
};

export default model('User', UserSchema);
