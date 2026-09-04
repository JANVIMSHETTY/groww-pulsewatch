import { prisma } from "./client.js";

export const MASTER_INSTRUMENTS = [
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
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    exchange: "NSE",
    sector: "Banking & Finance",
    dayOpen: 1240.0,
    previousClose: 1235.5,
    fiftyTwoWeekHigh: 1335.0,
    fiftyTwoWeekLow: 910.0,
    upperCircuit: 1359.0,
    lowerCircuit: 1111.9,
    baselineVolume20D: 12000000,
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    exchange: "NSE",
    sector: "Public Banking",
    dayOpen: 815.0,
    previousClose: 810.0,
    fiftyTwoWeekHigh: 912.0,
    fiftyTwoWeekLow: 555.0,
    upperCircuit: 891.0,
    lowerCircuit: 729.0,
    baselineVolume20D: 18000000,
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
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    exchange: "NSE",
    sector: "FMCG",
    dayOpen: 490.0,
    previousClose: 488.5,
    fiftyTwoWeekHigh: 528.5,
    fiftyTwoWeekLow: 399.3,
    upperCircuit: 537.3,
    lowerCircuit: 439.6,
    baselineVolume20D: 15000000,
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Ltd",
    exchange: "NSE",
    sector: "Infrastructure & Engineering",
    dayOpen: 3620.0,
    previousClose: 3605.0,
    fiftyTwoWeekHigh: 3919.9,
    fiftyTwoWeekLow: 2850.0,
    upperCircuit: 3965.5,
    lowerCircuit: 3244.5,
    baselineVolume20D: 2400000,
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
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd",
    exchange: "NSE",
    sector: "NBFC & Financial Services",
    dayOpen: 7120.0,
    previousClose: 7090.0,
    fiftyTwoWeekHigh: 7850.0,
    fiftyTwoWeekLow: 6160.0,
    upperCircuit: 7799.0,
    lowerCircuit: 6381.0,
    baselineVolume20D: 1600000,
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India Ltd",
    exchange: "NSE",
    sector: "Automotive",
    dayOpen: 12450.0,
    previousClose: 12380.0,
    fiftyTwoWeekHigh: 13680.0,
    fiftyTwoWeekLow: 9737.0,
    upperCircuit: 13618.0,
    lowerCircuit: 11142.0,
    baselineVolume20D: 480000,
  },
  {
    symbol: "TITAN",
    name: "Titan Company Ltd",
    exchange: "NSE",
    sector: "Consumer Discretionary",
    dayOpen: 3450.0,
    previousClose: 3425.0,
    fiftyTwoWeekHigh: 3886.9,
    fiftyTwoWeekLow: 3055.0,
    upperCircuit: 3767.5,
    lowerCircuit: 3082.5,
    baselineVolume20D: 950000,
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries Ltd",
    exchange: "NSE",
    sector: "Healthcare & Pharma",
    dayOpen: 1780.0,
    previousClose: 1772.0,
    fiftyTwoWeekHigh: 1960.0,
    fiftyTwoWeekLow: 1100.0,
    upperCircuit: 1949.2,
    lowerCircuit: 1594.8,
    baselineVolume20D: 2200000,
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    exchange: "NSE",
    sector: "Information Technology",
    dayOpen: 550.0,
    previousClose: 546.0,
    fiftyTwoWeekHigh: 595.0,
    fiftyTwoWeekLow: 375.0,
    upperCircuit: 600.6,
    lowerCircuit: 491.4,
    baselineVolume20D: 7200000,
  },
  {
    symbol: "ADANIENT",
    name: "Adani Enterprises Ltd",
    exchange: "NSE",
    sector: "Metals & Mining / Energy",
    dayOpen: 2950.0,
    previousClose: 2920.0,
    fiftyTwoWeekHigh: 3743.0,
    fiftyTwoWeekLow: 2142.0,
    upperCircuit: 3212.0,
    lowerCircuit: 2628.0,
    baselineVolume20D: 3100000,
  },
  {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank Ltd",
    exchange: "NSE",
    sector: "Banking & Finance",
    dayOpen: 1780.0,
    previousClose: 1775.0,
    fiftyTwoWeekHigh: 1930.0,
    fiftyTwoWeekLow: 1544.0,
    upperCircuit: 1952.5,
    lowerCircuit: 1597.5,
    baselineVolume20D: 3900000,
  },
  {
    symbol: "AXISBANK",
    name: "Axis Bank Ltd",
    exchange: "NSE",
    sector: "Banking & Finance",
    dayOpen: 1180.0,
    previousClose: 1172.0,
    fiftyTwoWeekHigh: 1339.65,
    fiftyTwoWeekLow: 951.0,
    upperCircuit: 1289.2,
    lowerCircuit: 1054.8,
    baselineVolume20D: 8500000,
  }
];

async function main() {
  console.log("Seeding 20 Indian instruments and multi-user accounts...");

  // 1. Seed Master Instruments
  for (const inst of MASTER_INSTRUMENTS) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: inst,
      create: inst,
    });
  }

  // 2. Multi-User Accounts
  const usersData = [
    {
      id: "usr_groww_001",
      email: "riya.sharma@groww.in",
      name: "Riya Sharma",
      activeDeviceId: "device_macbook_pro",
      lastViewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours away
      watchlistName: "Growth & Momentum Core",
      symbols: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ZOMATO", "TATASTEEL", "TATAMOTORS", "BHARTIARTL", "BAJFINANCE", "TITAN", "MARUTI", "ICICIBANK", "SBIN", "LT", "ITC"],
    },
    {
      id: "usr_groww_002",
      email: "aarav.patel@groww.in",
      name: "Aarav Patel",
      activeDeviceId: "device_iphone_16",
      lastViewedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins away
      watchlistName: "Banking & Bluechips",
      symbols: ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "BAJFINANCE", "RELIANCE", "TCS", "LT", "ITC"],
    },
    {
      id: "usr_groww_003",
      email: "priya.nair@groww.in",
      name: "Priya Nair",
      activeDeviceId: "device_ipad_air",
      lastViewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day away
      watchlistName: "High Beta Tech & Energy",
      symbols: ["ZOMATO", "INFY", "TCS", "WIPRO", "ADANIENT", "TATASTEEL", "TATAMOTORS", "BHARTIARTL", "SUNPHARMA"],
    }
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        lastViewedAt: u.lastViewedAt,
        activeDeviceId: u.activeDeviceId,
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        lastViewedAt: u.lastViewedAt,
        activeDeviceId: u.activeDeviceId,
      },
    });

    let defaultWl = await prisma.watchlist.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    if (!defaultWl) {
      defaultWl = await prisma.watchlist.create({
        data: {
          userId: user.id,
          name: u.watchlistName,
          isDefault: true,
        },
      });
    }

    // Add symbols
    for (const sym of u.symbols) {
      await prisma.watchlistItem.upsert({
        where: {
          watchlistId_symbol: { watchlistId: defaultWl.id, symbol: sym },
        },
        update: {},
        create: {
          watchlistId: defaultWl.id,
          symbol: sym,
        },
      });

      // Historical snapshot for each at lastViewedAt
      const inst = MASTER_INSTRUMENTS.find((i) => i.symbol === sym);
      if (inst) {
        const variance = (Math.random() - 0.49) * 0.02;
        await prisma.tickSnapshot.create({
          data: {
            symbol: sym,
            price: Number((inst.previousClose * (1 + variance)).toFixed(2)),
            volume: Math.floor(inst.baselineVolume20D * 0.35),
            timestamp: u.lastViewedAt,
          },
        });
      }
    }
  }

  console.log("Successfully seeded 20 Indian instruments and 3 user profiles with distinct watchlists!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
