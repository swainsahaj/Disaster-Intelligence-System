const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma');

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    let answer = '';

    process.stdout.write(question);
    stdin.resume();
    stdin.setEncoding('utf8');

    if (hidden) stdin.setRawMode(true);

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          if (hidden) stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          process.exit(1);
        }

        if (character === '\r' || character === '\n') {
          if (hidden) stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(answer);
          return;
        }

        if (character === '\u007f' || character === '\b') {
          if (answer.length > 0) {
            answer = answer.slice(0, -1);
            if (hidden) process.stdout.write('\b \b');
          }
        } else {
          answer += character;
          if (hidden) process.stdout.write('*');
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  const name = await ask('Admin name: ');
  const email = await ask('Admin email: ');
  const password = await ask('Admin password: ', true);
  const confirmation = await ask('Confirm password: ', true);

  if (!name.trim() || !email.trim()) {
    throw new Error('Name and email are required.');
  }

  if (password.length < 12) {
    throw new Error('Use at least 12 characters for the admin password.');
  }

  if (password !== confirmation) {
    throw new Error('Passwords do not match.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.trim() }
  });

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log(`Admin created: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
