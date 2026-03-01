import { PrismaClient, ServiceCategory, ProfessionalType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🐕 Seeding DogFela database...");

  // ─── Super Admin ─────────────────────────────────────────────
  const adminPassword = await hash("DogFela2026!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@dogfela.pt" },
    update: {},
    create: {
      name: "Dog Fella Admin",
      email: "admin@dogfela.pt",
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      phone: "+351910122469",
    },
  });
  console.log(`✅ Super Admin criado: ${superAdmin.email}`);

  // ─── Serviços ────────────────────────────────────────────────
  const services = [
    // Creche
    {
      name: "Creche Dia Inteiro",
      description: "Dia completo de diversão, socialização e cuidados para o seu cão. Das 9h às 18h com actividades, brincadeiras e descanso supervisionado.",
      category: ServiceCategory.CRECHE,
      price: 15,
      duration: 540,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Creche Meio Dia — Manhã",
      description: "Manhã de actividades e socialização. Das 9h às 13h. Ideal para cães que precisam de menos tempo de creche.",
      category: ServiceCategory.CRECHE,
      price: 10,
      duration: 240,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Creche Meio Dia — Tarde",
      description: "Tarde de brincadeiras e descanso supervisionado. Das 14h às 18h. Perfeito para donos que trabalham de manhã.",
      category: ServiceCategory.CRECHE,
      price: 10,
      duration: 240,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Hora Extra",
      description: "Extensão do horário da creche após as 18h. Cada hora adicional com supervisão e cuidados incluídos.",
      category: ServiceCategory.CRECHE,
      price: 3,
      duration: 60,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    // Passeios
    {
      name: "Passeio Individual",
      description: "Passeio exclusivo de 30 minutos com atenção individualizada. Ideal para cães que necessitam de exercício extra ou socialização gradual.",
      category: ServiceCategory.PASSEIOS,
      price: 8,
      duration: 30,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Passeio em Grupo",
      description: "Passeio de 45 minutos em grupo pequeno (máx. 5 cães). Excelente para socialização e exercício ao ar livre.",
      category: ServiceCategory.PASSEIOS,
      price: 6,
      duration: 45,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Passeio Aventura",
      description: "Trilho de 1h30 pela natureza em Santo Tirso. Exploração de terrenos, rios e florestas com supervisão especializada.",
      category: ServiceCategory.PASSEIOS,
      price: 15,
      duration: 90,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    // Banho & Tosa (parceiro)
    {
      name: "Banho Simples",
      description: "Banho completo com champô adequado ao tipo de pelo, secagem e escovagem. Inclui limpeza de ouvidos.",
      category: ServiceCategory.BANHO_TOSA,
      price: 12,
      duration: 45,
      professionalType: ProfessionalType.PARCEIRO,
    },
    {
      name: "Banho + Tosa Higiénica",
      description: "Banho completo com tosa higiénica (patas, barriga, zona genital). Inclui corte de unhas e limpeza de ouvidos.",
      category: ServiceCategory.BANHO_TOSA,
      price: 20,
      duration: 60,
      professionalType: ProfessionalType.PARCEIRO,
    },
    {
      name: "Banho + Tosa Completa",
      description: "Tratamento completo: banho, tosa de corpo inteiro, corte de unhas, limpeza de ouvidos e perfume. O seu cão vai sair um príncipe!",
      category: ServiceCategory.BANHO_TOSA,
      price: 30,
      duration: 90,
      professionalType: ProfessionalType.PARCEIRO,
    },
    {
      name: "Corte de Unhas",
      description: "Corte de unhas seguro e profissional. Rápido e sem stress para o seu cão.",
      category: ServiceCategory.BANHO_TOSA,
      price: 5,
      duration: 15,
      professionalType: ProfessionalType.PARCEIRO,
    },
    // Hotel Canino
    {
      name: "Pernoita",
      description: "Estadia nocturna das 18h às 9h do dia seguinte. Inclui jantar, passeio nocturno e pequeno-almoço.",
      category: ServiceCategory.HOTEL,
      price: 20,
      duration: 900,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Fim-de-semana",
      description: "Estadia completa de sexta (18h) a segunda (9h). Inclui todas as refeições, passeios e actividades de creche.",
      category: ServiceCategory.HOTEL,
      price: 50,
      duration: 3780,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    {
      name: "Semana Completa",
      description: "Estadia de 7 dias com todos os cuidados incluídos: refeições, passeios diários, actividades de creche e muito carinho.",
      category: ServiceCategory.HOTEL,
      price: 90,
      duration: 10080,
      professionalType: ProfessionalType.PRINCIPAL,
    },
    // Adestramento (futuro — inactivo)
    {
      name: "Obediência Básica",
      description: "Programa de 4 sessões para comandos básicos: senta, fica, deita, junto. Ideal para cachorros e cães jovens.",
      category: ServiceCategory.ADESTRAMENTO,
      price: 80,
      duration: 60,
      professionalType: ProfessionalType.PRINCIPAL,
      active: false,
    },
    {
      name: "Socialização",
      description: "Sessões de socialização controlada com outros cães e pessoas. Reduz medo e agressividade.",
      category: ServiceCategory.ADESTRAMENTO,
      price: 25,
      duration: 45,
      professionalType: ProfessionalType.PRINCIPAL,
      active: false,
    },
    {
      name: "Correcção Comportamental",
      description: "Programa personalizado para resolver problemas de comportamento: ansiedade de separação, destrutividade, latidos excessivos.",
      category: ServiceCategory.ADESTRAMENTO,
      price: 120,
      duration: 60,
      professionalType: ProfessionalType.PRINCIPAL,
      active: false,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, "-").replace(/[—]/g, "-") },
      update: { ...service, price: service.price },
      create: { ...service, price: service.price },
    });
  }
  console.log(`✅ ${services.length} serviços criados`);

  // ─── Packs ───────────────────────────────────────────────────
  const crecheInteiro = await prisma.service.findFirst({ where: { name: "Creche Dia Inteiro" } });
  const banhoSimples = await prisma.service.findFirst({ where: { name: "Banho Simples" } });
  const pernoita = await prisma.service.findFirst({ where: { name: "Pernoita" } });

  if (crecheInteiro) {
    const pack1 = await prisma.pack.upsert({
      where: { id: "pack-mensal-creche" },
      update: {},
      create: {
        id: "pack-mensal-creche",
        name: "Pack Mensal Creche",
        description: "20 dias de creche por mês. O melhor custo-benefício para quem usa a creche regularmente. Poupe 50€!",
        totalSessions: 20,
        price: 250,
        services: {
          create: { serviceId: crecheInteiro.id },
        },
      },
    });
    console.log(`✅ Pack criado: ${pack1.name}`);
  }

  if (crecheInteiro) {
    const pack2 = await prisma.pack.upsert({
      where: { id: "pack-semanal-creche" },
      update: {},
      create: {
        id: "pack-semanal-creche",
        name: "Pack Semanal Creche",
        description: "5 dias de creche (segunda a sexta). Ideal para quem trabalha toda a semana. Poupe 10€!",
        totalSessions: 5,
        price: 65,
        services: {
          create: { serviceId: crecheInteiro.id },
        },
      },
    });
    console.log(`✅ Pack criado: ${pack2.name}`);
  }

  if (crecheInteiro && banhoSimples) {
    const pack3 = await prisma.pack.upsert({
      where: { id: "pack-creche-banho" },
      update: {},
      create: {
        id: "pack-creche-banho",
        name: "Pack Creche + Banho",
        description: "10 dias de creche + 2 banhos incluídos. O seu cão vai para casa limpo e feliz!",
        totalSessions: 10,
        price: 170,
        services: {
          create: [
            { serviceId: crecheInteiro.id },
            { serviceId: banhoSimples.id },
          ],
        },
      },
    });
    console.log(`✅ Pack criado: ${pack3.name}`);
  }

  if (pernoita) {
    const pack4 = await prisma.pack.upsert({
      where: { id: "pack-hotel-ferias" },
      update: {},
      create: {
        id: "pack-hotel-ferias",
        name: "Pack Hotel Férias",
        description: "14 noites de hotel canino para as suas férias. Todos os cuidados incluídos. Poupe 50€!",
        totalSessions: 14,
        price: 230,
        services: {
          create: { serviceId: pernoita.id },
        },
      },
    });
    console.log(`✅ Pack criado: ${pack4.name}`);
  }

  // ─── Templates de Mensagens WhatsApp ─────────────────────────
  const templates = [
    {
      name: "Lembrete de Reserva",
      type: "REMINDER" as const,
      content: "Olá {{nome}}! 🐕\n\nLembrete: O {{dogName}} tem reserva na Dog Fella amanhã, {{data}} às {{hora}}.\n\nServiço: {{servico}}\n\nNão se esqueça do boletim sanitário!\n\nAté lá! 🦴\n— Dog Fella",
    },
    {
      name: "Report Diário",
      type: "FOLLOW_UP" as const,
      content: "Olá {{nome}}! 🐾\n\nO {{dogName}} teve um dia incrível na creche! Brincou com os amigos, comeu bem e portou-se lindamente.\n\nDescanso merecido em casa! 😊\n\n— Dog Fella 🦴",
    },
    {
      name: "Aniversário do Cão",
      type: "BIRTHDAY" as const,
      content: "Parabéns ao {{dogName}}! 🎂🐕\n\nNa Dog Fella preparámos um dia especial com treats e brincadeiras!\n\nDesconto de 20% na próxima reserva durante este mês! 🎁\n\n— Dog Fella 🦴",
    },
    {
      name: "Promoção Novo Serviço",
      type: "PROMOTION" as const,
      content: "Olá {{nome}}! ✨\n\nNovidade na Dog Fella: {{servico}}!\n\nAgende já para o {{dogName}} e aproveite condições especiais de lançamento!\n\n— Dog Fella 🦴",
    },
    {
      name: "Reactivação Cliente",
      type: "REACTIVATION" as const,
      content: "Olá {{nome}}! 🐾\n\nSentimos falta do {{dogName}} na Dog Fella! Já passaram {{dias}} dias desde a última visita.\n\nTemos condições especiais à vossa espera!\n\n— Dog Fella 🦴",
    },
  ];

  for (const template of templates) {
    await prisma.messageTemplate.upsert({
      where: { id: template.name.toLowerCase().replace(/\s+/g, "-") },
      update: { content: template.content },
      create: {
        id: template.name.toLowerCase().replace(/\s+/g, "-"),
        ...template,
      },
    });
  }
  console.log(`✅ ${templates.length} templates de mensagem criados`);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("   Login: admin@dogfela.pt / DogFela2026!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
