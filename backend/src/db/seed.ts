import { prisma } from "./client.js";

async function main() {
  console.log("Seeding database for Groww Code 2026 PulseWatch...");

  // Upsert Default User
  const defaultUser = await prisma.user.upsert({
    where: { email: "investor@groww.in" },
    update: {},
    create: {
      id: "usr_groww_001",
      email: "investor@groww.in",
      name: "Riya Sharma",
      activeDeviceId: "device_macbook_pro",
      // Set lastViewedAt to 2 hours ago to demonstrate immediate 'While You Were Away'
      lastViewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  const instrumentsData = [
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      exchange: "NSE",
      sector: "Energy & Conglomerate",
      dayOpen: 2980.0,
      previousClose: 2975.0,
      fiftyTwoWeekHigh: 3217.9,
      fiftyTwoWeekLow: 2220.3,
      upperCircuit: 3272.5,
      lowerCircuit: 2677.5,
      baselineVolume20D: 5400000,
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd",
      exchange: "NSE",
      sector: "Information Technology",
      dayOpen: 4120.0,
      previousClose: 4105.0,
      fiftyTwoWeekHigh: 4592.25,
      fiftyTwoWeekLow: 3313.0,
      upperCircuit: 4515.5,
      lowerCircuit: 3694.5,
      baselineVolume20D: 2100000,
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd",
      exchange: "NSE",
      sector: "Banking & Finance",
      dayOpen: 1650.0,
      previousClose: 1642.0,
      fiftyTwoWeekHigh: 1794.0,
      fiftyTwoWeekLow: 1363.55,
      upperCircuit: 1806.2,
      lowerCircuit: 1477.8,
      baselineVolume20D: 14500000,
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd",
      exchange: "NSE",
      sector: "Information Technology",
      dayOpen: 1840.0,
      previousClose: 1835.0,
      fiftyTwoWeekHigh: 1991.45,
      fiftyTwoWeekLow: 1355.0,
      upperCircuit: 2018.5,
      lowerCircuit: 1651.5,
      baselineVolume20D: 6200000,
    },
    {
      symbol: "TATASTEEL",
      name: "Tata Steel Ltd",
      exchange: "NSE",
      sector: "Metals & Mining",
      dayOpen: 154.5,
      previousClose: 156.0,
      fiftyTwoWeekHigh: 184.6,
      fiftyTwoWeekLow: 114.25,
      upperCircuit: 171.6,
      lowerCircuit: 140.4,
      baselineVolume20D: 38000000,
    },
    {
      symbol: "ZOMATO",
      name: "Zomato Ltd (Eternal)",
      exchange: "NSE",
      sector: "Consumer Tech",
      dayOpen: 260.0,
      previousClose: 254.2,
      fiftyTwoWeekHigh: 298.2,
      fiftyTwoWeekLow: 98.0,
      upperCircuit: 280.0,
      lowerCircuit: 228.0,
      baselineVolume20D: 45000000,
    },
    {
      symbol: "TATAMOTORS",
      name: "Tata Motors Ltd",
      exchange: "NSE",
      sector: "Automotive",
      dayOpen: 980.0,
      previousClose: 972.0,
      fiftyTwoWeekHigh: 1179.0,
      fiftyTwoWeekLow: 593.5,
      upperCircuit: 1069.2,
      lowerCircuit: 874.8,
      baselineVolume20D: 11000000,
    },
    {
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Ltd",
      exchange: "NSE",
      sector: "Telecom",
      dayOpen: 1590.0,
      previousClose: 1585.0,
      fiftyTwoWeekHigh: 1779.0,
      fiftyTwoWeekLow: 885.0,
      upperCircuit: 1743.5,
      lowerCircuit: 1426.5,
      baselineVolume20D: 7800000,
    }
  ];

  for (const inst of instrumentsData) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: inst,
      create: inst,
    });
  }

  // Create Default Watchlist for User
  let defaultWatchlist = await prisma.watchlist.findFirst({
    where: { userId: defaultUser.id, isDefault: true },
  });

  if (!defaultWatchlist) {
    defaultWatchlist = await prisma.watchlist.create({
      data: {
        userId: defaultUser.id,
        name: "My Core Watchlist",
        isDefault: true,
      },
    });

    for (const inst of instrumentsData) {
      await prisma.watchlistItem.create({
        data: {
          watchlistId: defaultWatchlist.id,
          symbol: inst.symbol,
        },
      });
    }
  }

  // Seed historic baseline snapshot at lastViewedAt (2 hours ago)
  const lastSeen = defaultUser.lastViewedAt;
  for (const inst of instrumentsData) {
    // Generate slight price variance at last viewed time
    const variance = (Math.random() - 0.5) * 0.015;
    const historicPrice = Number((inst.previousClose * (1 + variance)).toFixed(2));
    const historicVolume = Math.floor(inst.baselineVolume20D * 0.35);

    await prisma.tickSnapshot.create({
      data: {
        symbol: inst.symbol,
        price: historicPrice,
        volume: historicVolume,
        timestamp: lastSeen,
      },
    });
  }

  console.log("Database seeded successfully with 8 core instruments and initial historical snapshots.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
