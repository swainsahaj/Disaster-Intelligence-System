const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma');

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123Ss@';

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email,
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Admin created successfully');
  console.log({ id: user.id, email: user.email, role: user.role });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });