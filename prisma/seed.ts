import { PrismaClient } from './generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Admin User from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@alitrucks.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  // Hash the admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: 'ADMIN',
      userType: 'INDIVIDUAL',
    },
    create: {
      id: `admin_${Date.now()}`,
      email: adminEmail,
      name: adminName,
      role: 'ADMIN',
      userType: 'INDIVIDUAL',
      emailVerified: true,
    },
  });

  // Create admin account with password
  await prisma.account.upsert({
    where: { 
      userId_providerId: {
        userId: adminUser.id,
        providerId: 'credential'
      }
    },
    update: {
      password: hashedPassword,
    },
    create: {
      id: `admin_account_${Date.now()}`,
      accountId: adminUser.id,
      providerId: 'credential',
      userId: adminUser.id,
      password: hashedPassword,
    },
  });

  console.log(`Admin user created: ${adminEmail}`);

  // Seed Vehicle Makes
  const vehicleMakes = [
    'Volvo', 'Scania', 'Mercedes-Benz', 'MAN', 'DAF', 'Iveco', 'Renault', 'Ford', 'Isuzu', 'Mitsubishi'
  ];

  const createdMakes = [];
  for (const makeName of vehicleMakes) {
    const make = await prisma.vehicleMake.upsert({
      where: { name: makeName },
      update: {},
      create: { name: makeName },
    });
    createdMakes.push(make);
  }

  // Seed Vehicle Types
  const vehicleTypes = [
    'Truck', 'Semi-trailer', 'Trailer', 'Box truck', 'Flatbed', 'Refrigerated truck', 
    'Tanker', 'Dump truck', 'Crane truck', 'Tow truck', 'Fire truck', 'Garbage truck'
  ];

  for (const typeName of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
  }

  // Seed Fuel Types
  const fuelTypes = [
    'Diesel', 'Petrol', 'Electric', 'Hybrid', 'CNG', 'LNG', 'Hydrogen', 'Biodiesel'
  ];

  for (const fuelTypeName of fuelTypes) {
    await prisma.fuelType.upsert({
      where: { name: fuelTypeName },
      update: {},
      create: { name: fuelTypeName },
    });
  }

  // Seed Vehicle Models
  const vehicleModels = {
    'Volvo': ['FH', 'FM', 'FMX', 'FL', 'FE'],
    'Scania': ['R-Series', 'S-Series', 'P-Series', 'G-Series', 'L-Series'],
    'Mercedes-Benz': ['Actros', 'Arocs', 'Atego', 'Econic', 'Antos'],
    'MAN': ['TGX', 'TGS', 'TGM', 'TGL', 'TGE'],
    'DAF': ['XF', 'CF', 'LF', 'XG', 'XG+'],
    'Iveco': ['Stralis', 'Trakker', 'Eurocargo', 'Daily', 'S-Way'],
    'Renault': ['T-Series', 'C-Series', 'K-Series', 'D-Series', 'Master'],
    'Ford': ['F-Series', 'Transit', 'Ranger', 'E-Series', 'Cargo'],
    'Isuzu': ['N-Series', 'F-Series', 'C-Series', 'D-Max', 'MU-X'],
    'Mitsubishi': ['Fuso Canter', 'Fuso Fighter', 'L200', 'Outlander', 'Pajero']
  };

  for (const make of createdMakes) {
    const models = vehicleModels[make.name as keyof typeof vehicleModels];
    if (models) {
      for (const modelName of models) {
        await prisma.vehicleModel.upsert({
          where: { 
            name_makeId: {
              name: modelName,
              makeId: make.id
            }
          },
          update: {},
          create: { 
            name: modelName,
            makeId: make.id
          },
        });
      }
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });