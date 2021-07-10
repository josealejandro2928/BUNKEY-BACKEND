import { User } from './../models/user.model';
const bcrypt = require('bcrypt');

export class Seeders {
  async initUsers() {
    const pass = bcrypt.hashSync('admin', 12);
    const user = {
      name: 'admin',
      password: pass,
      email: 'admin@localhost.com',
    };
    const firstUser = await User.findOne({ email: 'admin@localhost.com' });
    // console.log("🚀 ~ file: index.ts ~ line 13 ~ Seeders ~ initUsers ~ firstUser", firstUser)
    if (!firstUser) {
      await User.create(user);
    }
  }
}
