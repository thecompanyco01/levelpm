#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// All 50 states + DC with property management licensing data
const states = [
  { state: "Alabama", abbr: "AL", slug: "alabama", licenseRequired: "real estate license", authority: "Alabama Real Estate Commission (AREC)", examQuestions: 140, passingScore: "70%", coursesRequired: "60 hours pre-license education", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Alabama requires a real estate license for property managers who perform leasing activities. Property managers who only collect rent and manage maintenance may be exempt.", population: "5.1M", renters: "~650,000 renter households", topCities: "Birmingham, Huntsville, Montgomery, Mobile" },
  { state: "Alaska", abbr: "AK", slug: "alaska", licenseRequired: "real estate license", authority: "Alaska Real Estate Commission", examQuestions: 116, passingScore: "76%", coursesRequired: "40 hours pre-license", brokerRequired: true, averageCost: "$600-$1,000", renewalPeriod: "2 years", keyFact: "Alaska has a smaller PM market but high demand due to military installations. Property managers must be licensed real estate licensees or work under a licensed broker.", population: "733K", renters: "~100,000 renter households", topCities: "Anchorage, Fairbanks, Juneau" },
  { state: "Arizona", abbr: "AZ", slug: "arizona", licenseRequired: "real estate license", authority: "Arizona Department of Real Estate (ADRE)", examQuestions: 180, passingScore: "75%", coursesRequired: "90 hours pre-license education", brokerRequired: true, averageCost: "$500-$1,200", renewalPeriod: "2 years", keyFact: "Arizona is one of the fastest-growing rental markets in the US. A real estate license is required for property managers who perform leasing activities. The state requires 90 hours of pre-license education.", population: "7.4M", renters: "~900,000 renter households", topCities: "Phoenix, Tucson, Mesa, Scottsdale, Tempe" },
  { state: "Arkansas", abbr: "AR", slug: "arkansas", licenseRequired: "real estate license", authority: "Arkansas Real Estate Commission (AREC)", examQuestions: 130, passingScore: "70%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$400-$800", renewalPeriod: "2 years (annual for first 2 years)", keyFact: "Arkansas requires a real estate license for property management. The state is relatively affordable for licensing with lower education requirements.", population: "3.0M", renters: "~400,000 renter households", topCities: "Little Rock, Fayetteville, Fort Smith, Bentonville" },
  { state: "Colorado", abbr: "CO", slug: "colorado", licenseRequired: "real estate license", authority: "Colorado Division of Real Estate (DORA)", examQuestions: 154, passingScore: "75%", coursesRequired: "168 hours pre-license education", brokerRequired: false, averageCost: "$800-$1,500", renewalPeriod: "3 years", keyFact: "Colorado has one of the highest pre-license education requirements in the country at 168 hours. All licensees start as brokers (Colorado eliminated the 'salesperson' designation). Denver is one of the hottest rental markets.", population: "5.8M", renters: "~800,000 renter households", topCities: "Denver, Colorado Springs, Aurora, Fort Collins, Boulder" },
  { state: "Connecticut", abbr: "CT", slug: "connecticut", licenseRequired: "real estate license", authority: "Connecticut Department of Consumer Protection", examQuestions: 110, passingScore: "70%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "1 year", keyFact: "Connecticut requires real estate licensing for PM activities. The state has strong tenant protection laws that PMs must understand.", population: "3.6M", renters: "~500,000 renter households", topCities: "Bridgeport, New Haven, Hartford, Stamford" },
  { state: "Delaware", abbr: "DE", slug: "delaware", licenseRequired: "real estate license", authority: "Delaware Real Estate Commission", examQuestions: 110, passingScore: "75%", coursesRequired: "99 hours pre-license", brokerRequired: true, averageCost: "$600-$1,000", renewalPeriod: "2 years", keyFact: "Delaware requires PM licensing through the real estate commission. The state is landlord-friendly compared to neighboring states.", population: "1.0M", renters: "~130,000 renter households", topCities: "Wilmington, Dover, Newark" },
  { state: "Georgia", abbr: "GA", slug: "georgia", licenseRequired: "real estate license (with exemptions)", authority: "Georgia Real Estate Commission (GREC)", examQuestions: 152, passingScore: "72%", coursesRequired: "75 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "4 years", keyFact: "Georgia requires a real estate license for PM activities, but there's an exemption for owners managing their own properties. Atlanta is a major rental market with strong population growth.", population: "10.9M", renters: "~1.4M renter households", topCities: "Atlanta, Augusta, Savannah, Columbus" },
  { state: "Hawaii", abbr: "HI", slug: "hawaii", licenseRequired: "real estate license", authority: "Hawaii Real Estate Commission (HIREC)", examQuestions: 80, passingScore: "70%", coursesRequired: "60 hours pre-license + 20 hours PM-specific (Haw 1 & 2)", brokerRequired: true, averageCost: "$700-$1,200", renewalPeriod: "2 years", keyFact: "Hawaii is unique — they require specific property management courses (Haw 1 & 2) in addition to standard pre-license education. Vacation rental management is a massive market.", population: "1.4M", renters: "~200,000 renter households", topCities: "Honolulu, Pearl City, Hilo, Kailua" },
  { state: "Idaho", abbr: "ID", slug: "idaho", licenseRequired: "real estate license", authority: "Idaho Real Estate Commission (IREC)", examQuestions: 120, passingScore: "70%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Idaho is one of the fastest-growing states. Boise's rental market has exploded. A real estate license is required for property management.", population: "1.9M", renters: "~230,000 renter households", topCities: "Boise, Meridian, Nampa, Idaho Falls" },
  { state: "Illinois", abbr: "IL", slug: "illinois", licenseRequired: "real estate license (with community association manager license option)", authority: "Illinois Division of Professional Regulation (IDFPR)", examQuestions: 140, passingScore: "75%", coursesRequired: "90 hours pre-license (broker) or 15 hours (leasing agent)", brokerRequired: true, averageCost: "$600-$1,200", renewalPeriod: "2 years", keyFact: "Illinois has a separate Community Association Manager license for HOA management. For residential PM, you need a real estate broker license. Chicago is one of the largest rental markets in the Midwest.", population: "12.6M", renters: "~1.8M renter households", topCities: "Chicago, Aurora, Naperville, Rockford" },
  { state: "Indiana", abbr: "IN", slug: "indiana", licenseRequired: "not strictly required", authority: "Indiana Professional Licensing Agency (IPLA)", examQuestions: 0, passingScore: "N/A", coursesRequired: "N/A (but recommended)", brokerRequired: false, averageCost: "N/A (voluntary)", renewalPeriod: "N/A", keyFact: "Indiana does NOT require a real estate license for property management as long as you don't perform real estate sales activities. This makes it one of the easiest states to start a PM company. However, getting licensed adds credibility.", population: "6.8M", renters: "~900,000 renter households", topCities: "Indianapolis, Fort Wayne, Evansville, South Bend" },
  { state: "Iowa", abbr: "IA", slug: "iowa", licenseRequired: "real estate license (with PM exemptions)", authority: "Iowa Real Estate Commission (IREC)", examQuestions: 120, passingScore: "70%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$400-$800", renewalPeriod: "3 years", keyFact: "Iowa has some PM exemptions — property managers who don't handle leasing may not need a license. However, most PM companies get licensed for liability and credibility.", population: "3.2M", renters: "~420,000 renter households", topCities: "Des Moines, Cedar Rapids, Davenport, Iowa City" },
  { state: "Kansas", abbr: "KS", slug: "kansas", licenseRequired: "real estate license (with PM exemptions)", authority: "Kansas Real Estate Commission (KREC)", examQuestions: 120, passingScore: "70%", coursesRequired: "30 hours pre-license", brokerRequired: true, averageCost: "$350-$700", renewalPeriod: "2 years", keyFact: "Kansas has some of the lowest licensing education requirements at just 30 hours. PM license exemptions exist for those managing their own property.", population: "2.9M", renters: "~400,000 renter households", topCities: "Wichita, Overland Park, Kansas City, Olathe" },
  { state: "Kentucky", abbr: "KY", slug: "kentucky", licenseRequired: "real estate license", authority: "Kentucky Real Estate Commission (KREC)", examQuestions: 130, passingScore: "75%", coursesRequired: "96 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "Kentucky requires real estate licensing for PM. The Louisville and Lexington markets are growing steadily with increasing rental demand.", population: "4.5M", renters: "~600,000 renter households", topCities: "Louisville, Lexington, Bowling Green, Covington" },
  { state: "Louisiana", abbr: "LA", slug: "louisiana", licenseRequired: "real estate license", authority: "Louisiana Real Estate Commission (LREC)", examQuestions: 150, passingScore: "70%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "1 year", keyFact: "Louisiana requires annual license renewal — more frequent than most states. The New Orleans rental market includes a unique short-term rental component.", population: "4.6M", renters: "~650,000 renter households", topCities: "New Orleans, Baton Rouge, Shreveport, Lafayette" },
  { state: "Maine", abbr: "ME", slug: "maine", licenseRequired: "real estate license", authority: "Maine Real Estate Commission", examQuestions: 120, passingScore: "70%", coursesRequired: "55 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Maine has growing vacation rental management opportunities, especially along the coast. Standard real estate licensing requirements apply.", population: "1.4M", renters: "~190,000 renter households", topCities: "Portland, Lewiston, Bangor, South Portland" },
  { state: "Maryland", abbr: "MD", slug: "maryland", licenseRequired: "real estate license", authority: "Maryland Real Estate Commission (MREC)", examQuestions: 110, passingScore: "70%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "Maryland has unique requirements — the state requires separate property management-specific courses. The DC metro rental market is one of the strongest in the country.", population: "6.2M", renters: "~800,000 renter households", topCities: "Baltimore, Columbia, Germantown, Silver Spring" },
  { state: "Massachusetts", abbr: "MA", slug: "massachusetts", licenseRequired: "real estate license (with exemptions for owner-managers)", authority: "Massachusetts Board of Registration of Real Estate Brokers and Salespersons", examQuestions: 120, passingScore: "70%", coursesRequired: "40 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "Massachusetts has strong tenant protection laws. Boston has one of the highest rent markets in the US. PM companies must navigate complex eviction procedures.", population: "7.0M", renters: "~1.0M renter households", topCities: "Boston, Worcester, Springfield, Cambridge" },
  { state: "Michigan", abbr: "MI", slug: "michigan", licenseRequired: "real estate license (with exemptions)", authority: "Michigan Department of Licensing and Regulatory Affairs (LARA)", examQuestions: 115, passingScore: "70%", coursesRequired: "40 hours pre-license", brokerRequired: true, averageCost: "$400-$800", renewalPeriod: "3 years", keyFact: "Michigan offers PM exemptions for property owners managing their own properties. Detroit is a major market for affordable investment properties and PM services.", population: "10.0M", renters: "~1.3M renter households", topCities: "Detroit, Grand Rapids, Ann Arbor, Lansing" },
  { state: "Minnesota", abbr: "MN", slug: "minnesota", licenseRequired: "real estate license", authority: "Minnesota Department of Commerce", examQuestions: 120, passingScore: "75%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "Minnesota has specific property management-related courses available. The Twin Cities metro area has a strong rental market with steady demand.", population: "5.7M", renters: "~750,000 renter households", topCities: "Minneapolis, St. Paul, Rochester, Bloomington" },
  { state: "Mississippi", abbr: "MS", slug: "mississippi", licenseRequired: "real estate license", authority: "Mississippi Real Estate Commission (MREC)", examQuestions: 110, passingScore: "70%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$400-$700", renewalPeriod: "1 year", keyFact: "Mississippi has among the lowest licensing costs in the country. The state is landlord-friendly with relatively few tenant protection laws.", population: "3.0M", renters: "~400,000 renter households", topCities: "Jackson, Gulfport, Southaven, Hattiesburg" },
  { state: "Missouri", abbr: "MO", slug: "missouri", licenseRequired: "real estate license (with exemptions)", authority: "Missouri Real Estate Commission (MREC)", examQuestions: 100, passingScore: "70%", coursesRequired: "48 hours pre-license", brokerRequired: true, averageCost: "$400-$800", renewalPeriod: "2 years", keyFact: "Missouri has exemptions for property managers who only collect rent and don't negotiate leases. St. Louis and Kansas City offer strong rental markets.", population: "6.2M", renters: "~850,000 renter households", topCities: "Kansas City, St. Louis, Springfield, Columbia" },
  { state: "Montana", abbr: "MT", slug: "montana", licenseRequired: "not strictly required", authority: "Montana Board of Realty Regulation", examQuestions: 0, passingScore: "N/A", coursesRequired: "N/A (license not required)", brokerRequired: false, averageCost: "N/A", renewalPeriod: "N/A", keyFact: "Montana is one of the few states that does NOT require a real estate license for property management. However, getting licensed is recommended for credibility and legal protection.", population: "1.1M", renters: "~140,000 renter households", topCities: "Billings, Missoula, Great Falls, Bozeman" },
  { state: "Nebraska", abbr: "NE", slug: "nebraska", licenseRequired: "real estate license", authority: "Nebraska Real Estate Commission (NREC)", examQuestions: 120, passingScore: "75%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Nebraska requires licensing for property management activities. Omaha and Lincoln are growing markets with steady rental demand.", population: "2.0M", renters: "~270,000 renter households", topCities: "Omaha, Lincoln, Bellevue, Grand Island" },
  { state: "Nevada", abbr: "NV", slug: "nevada", licenseRequired: "property management permit (or RE license)", authority: "Nevada Real Estate Division (NRED)", examQuestions: 120, passingScore: "75%", coursesRequired: "90 hours pre-license + 24 hours PM-specific", brokerRequired: true, averageCost: "$800-$1,500", renewalPeriod: "2 years", keyFact: "Nevada offers a specific property management permit in addition to the standard real estate license. Las Vegas is one of the biggest rental and vacation rental markets in the US.", population: "3.2M", renters: "~500,000 renter households", topCities: "Las Vegas, Henderson, Reno, North Las Vegas" },
  { state: "New Hampshire", abbr: "NH", slug: "new-hampshire", licenseRequired: "real estate license", authority: "New Hampshire Real Estate Commission", examQuestions: 110, passingScore: "70%", coursesRequired: "40 hours pre-license", brokerRequired: true, averageCost: "$400-$800", renewalPeriod: "2 years", keyFact: "New Hampshire has relatively low licensing requirements. No state income tax makes it attractive for PM business owners.", population: "1.4M", renters: "~180,000 renter households", topCities: "Manchester, Nashua, Concord, Dover" },
  { state: "New Jersey", abbr: "NJ", slug: "new-jersey", licenseRequired: "real estate license", authority: "New Jersey Real Estate Commission (NJREC)", examQuestions: 110, passingScore: "70%", coursesRequired: "75 hours pre-license", brokerRequired: true, averageCost: "$600-$1,100", renewalPeriod: "2 years", keyFact: "New Jersey has very strong tenant protection laws. PM companies must be well-versed in anti-eviction act requirements. High-demand rental market near NYC.", population: "9.3M", renters: "~1.3M renter households", topCities: "Newark, Jersey City, Paterson, Elizabeth" },
  { state: "New Mexico", abbr: "NM", slug: "new-mexico", licenseRequired: "real estate license", authority: "New Mexico Real Estate Commission (NMREC)", examQuestions: 110, passingScore: "70%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "3 years", keyFact: "New Mexico requires 90 hours of pre-license education. Albuquerque and Santa Fe have active rental markets with growing demand.", population: "2.1M", renters: "~300,000 renter households", topCities: "Albuquerque, Las Cruces, Santa Fe, Rio Rancho" },
  { state: "New York", abbr: "NY", slug: "new-york", licenseRequired: "real estate license", authority: "New York Department of State (DOS)", examQuestions: 75, passingScore: "70%", coursesRequired: "77 hours pre-license", brokerRequired: true, averageCost: "$700-$1,500", renewalPeriod: "2 years", keyFact: "New York has some of the most complex landlord-tenant laws in the US, especially in NYC. Rent stabilization, right to counsel for tenants, and strict eviction procedures make PM expertise highly valued.", population: "19.5M", renters: "~3.5M renter households", topCities: "New York City, Buffalo, Rochester, Albany" },
  { state: "North Carolina", abbr: "NC", slug: "north-carolina", licenseRequired: "real estate license", authority: "North Carolina Real Estate Commission (NCREC)", examQuestions: 140, passingScore: "75%", coursesRequired: "75 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "1 year (first year), then annual on birthday", keyFact: "North Carolina has a growing rental market, especially in Charlotte and the Research Triangle. All real estate licensees start as provisional brokers.", population: "10.7M", renters: "~1.4M renter households", topCities: "Charlotte, Raleigh, Durham, Greensboro" },
  { state: "North Dakota", abbr: "ND", slug: "north-dakota", licenseRequired: "real estate license", authority: "North Dakota Real Estate Commission", examQuestions: 110, passingScore: "70%", coursesRequired: "45 hours pre-license", brokerRequired: true, averageCost: "$400-$700", renewalPeriod: "1 year", keyFact: "North Dakota has lower licensing requirements. The oil boom areas (Williston Basin) created unexpected PM demand, though the market is more cyclical.", population: "780K", renters: "~110,000 renter households", topCities: "Fargo, Bismarck, Grand Forks, Minot" },
  { state: "Ohio", abbr: "OH", slug: "ohio", licenseRequired: "real estate license", authority: "Ohio Division of Real Estate (DRE)", examQuestions: 120, passingScore: "70%", coursesRequired: "120 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "3 years", keyFact: "Ohio requires 120 hours of pre-license education — more than most states. Columbus, Cleveland, and Cincinnati are strong rental markets with affordable entry points for investors.", population: "11.8M", renters: "~1.7M renter households", topCities: "Columbus, Cleveland, Cincinnati, Dayton" },
  { state: "Oklahoma", abbr: "OK", slug: "oklahoma", licenseRequired: "real estate license", authority: "Oklahoma Real Estate Commission (OREC)", examQuestions: 130, passingScore: "70%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "3 years", keyFact: "Oklahoma is landlord-friendly with reasonable licensing requirements. Oklahoma City and Tulsa have growing rental markets.", population: "4.0M", renters: "~550,000 renter households", topCities: "Oklahoma City, Tulsa, Norman, Broken Arrow" },
  { state: "Oregon", abbr: "OR", slug: "oregon", licenseRequired: "property management license", authority: "Oregon Real Estate Agency (OREA)", examQuestions: 100, passingScore: "75%", coursesRequired: "60 hours in property management-specific courses", brokerRequired: false, averageCost: "$600-$1,000", renewalPeriod: "2 years", keyFact: "Oregon is unique — it has a SEPARATE property management license distinct from real estate sales. You don't need a real estate license. Portland's rental market is heavily regulated with rent control laws.", population: "4.2M", renters: "~600,000 renter households", topCities: "Portland, Eugene, Salem, Bend" },
  { state: "Pennsylvania", abbr: "PA", slug: "pennsylvania", licenseRequired: "real estate license", authority: "Pennsylvania State Real Estate Commission", examQuestions: 110, passingScore: "75%", coursesRequired: "60 hours pre-license + 14 hours within first 2 years", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "Pennsylvania has different regulations by city — Philadelphia has extremely strong tenant protections. Pittsburgh and Philly are both major rental markets.", population: "13.0M", renters: "~1.8M renter households", topCities: "Philadelphia, Pittsburgh, Allentown, Reading" },
  { state: "Rhode Island", abbr: "RI", slug: "rhode-island", licenseRequired: "real estate license", authority: "Rhode Island Department of Business Regulation", examQuestions: 110, passingScore: "70%", coursesRequired: "45 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Rhode Island is a small market but Providence has strong rental demand. Relatively straightforward licensing process.", population: "1.1M", renters: "~160,000 renter households", topCities: "Providence, Warwick, Cranston, Pawtucket" },
  { state: "South Carolina", abbr: "SC", slug: "south-carolina", licenseRequired: "property manager-in-charge license", authority: "South Carolina Real Estate Commission (SCREC)", examQuestions: 120, passingScore: "70%", coursesRequired: "90 hours pre-license + PM-specific course", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "South Carolina has a specific 'Property Manager-in-Charge' designation. Charleston, Greenville, and Myrtle Beach have booming rental and vacation rental markets.", population: "5.3M", renters: "~700,000 renter households", topCities: "Charleston, Columbia, Greenville, Myrtle Beach" },
  { state: "South Dakota", abbr: "SD", slug: "south-dakota", licenseRequired: "not strictly required", authority: "South Dakota Real Estate Commission", examQuestions: 0, passingScore: "N/A", coursesRequired: "N/A", brokerRequired: false, averageCost: "N/A", renewalPeriod: "N/A", keyFact: "South Dakota does NOT require a specific license for property management. One of the most business-friendly states with no state income tax.", population: "900K", renters: "~115,000 renter households", topCities: "Sioux Falls, Rapid City, Aberdeen, Brookings" },
  { state: "Tennessee", abbr: "TN", slug: "tennessee", licenseRequired: "real estate license (with exemptions)", authority: "Tennessee Real Estate Commission (TREC)", examQuestions: 120, passingScore: "70%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Tennessee has exemptions for PMs who don't negotiate leases. Nashville is one of the fastest-growing rental markets. No state income tax makes it attractive.", population: "7.1M", renters: "~900,000 renter households", topCities: "Nashville, Memphis, Knoxville, Chattanooga" },
  { state: "Utah", abbr: "UT", slug: "utah", licenseRequired: "property management license", authority: "Utah Division of Real Estate (DRE)", examQuestions: 100, passingScore: "70%", coursesRequired: "48 hours PM-specific education", brokerRequired: false, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Utah offers a specific property management license separate from real estate. Salt Lake City has strong tech-driven population and rental growth.", population: "3.4M", renters: "~350,000 renter households", topCities: "Salt Lake City, West Valley City, Provo, Orem" },
  { state: "Vermont", abbr: "VT", slug: "vermont", licenseRequired: "not strictly required", authority: "Vermont Office of Professional Regulation", examQuestions: 0, passingScore: "N/A", coursesRequired: "N/A", brokerRequired: false, averageCost: "N/A", renewalPeriod: "N/A", keyFact: "Vermont does not require specific PM licensing but has strict tenant protection laws. Vacation rental management is a growing niche, especially near ski resorts.", population: "650K", renters: "~90,000 renter households", topCities: "Burlington, South Burlington, Rutland, Barre" },
  { state: "Virginia", abbr: "VA", slug: "virginia", licenseRequired: "real estate license", authority: "Virginia Real Estate Board (VREB)", examQuestions: 120, passingScore: "75%", coursesRequired: "60 hours pre-license", brokerRequired: true, averageCost: "$500-$1,000", renewalPeriod: "2 years", keyFact: "Virginia requires licensing for PM activities. Northern Virginia benefits from DC-area rental demand. The state has a Common Interest Community Manager license for HOAs.", population: "8.6M", renters: "~1.1M renter households", topCities: "Virginia Beach, Norfolk, Richmond, Arlington" },
  { state: "Washington", abbr: "WA", slug: "washington", licenseRequired: "real estate license", authority: "Washington Department of Licensing (DOL)", examQuestions: 140, passingScore: "70%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$600-$1,200", renewalPeriod: "2 years", keyFact: "Washington state (not DC) requires real estate licensing for PM. Seattle's rental market is highly competitive with complex regulations. No state income tax.", population: "7.7M", renters: "~1.1M renter households", topCities: "Seattle, Spokane, Tacoma, Vancouver" },
  { state: "West Virginia", abbr: "WV", slug: "west-virginia", licenseRequired: "real estate license", authority: "West Virginia Real Estate Commission", examQuestions: 110, passingScore: "70%", coursesRequired: "90 hours pre-license", brokerRequired: true, averageCost: "$400-$800", renewalPeriod: "2 years", keyFact: "West Virginia has affordable licensing costs. The rental market is smaller but steady, with opportunities in Morgantown (WVU) and Charleston.", population: "1.8M", renters: "~250,000 renter households", topCities: "Charleston, Huntington, Morgantown, Parkersburg" },
  { state: "Wisconsin", abbr: "WI", slug: "wisconsin", licenseRequired: "real estate license", authority: "Wisconsin Department of Safety and Professional Services (DSPS)", examQuestions: 100, passingScore: "75%", coursesRequired: "72 hours pre-license", brokerRequired: true, averageCost: "$500-$900", renewalPeriod: "2 years", keyFact: "Wisconsin requires real estate licensing for PM. Milwaukee and Madison have strong rental markets. The state has specific ATCP 134 tenant-landlord regulations.", population: "5.9M", renters: "~800,000 renter households", topCities: "Milwaukee, Madison, Green Bay, Kenosha" },
  { state: "Wyoming", abbr: "WY", slug: "wyoming", licenseRequired: "not strictly required (recommended)", authority: "Wyoming Real Estate Commission", examQuestions: 0, passingScore: "N/A", coursesRequired: "N/A", brokerRequired: false, averageCost: "N/A", renewalPeriod: "N/A", keyFact: "Wyoming does not have specific PM licensing requirements, but getting a real estate license is recommended. Small market but growing, especially in Jackson Hole area.", population: "580K", renters: "~75,000 renter households", topCities: "Cheyenne, Casper, Laramie, Gillette" },
  { state: "District of Columbia", abbr: "DC", slug: "district-of-columbia", licenseRequired: "property manager license", authority: "DC Real Estate Commission (DCREC)", examQuestions: 100, passingScore: "75%", coursesRequired: "60 hours pre-license + PM-specific courses", brokerRequired: true, averageCost: "$700-$1,300", renewalPeriod: "2 years", keyFact: "DC has a specific property manager license category. One of the highest-rent markets in the US with extremely strong tenant protections. PM companies must navigate complex local regulations.", population: "690K", renters: "~280,000 renter households", topCities: "Washington DC (all neighborhoods)" },
];

// Already have dedicated pages for CA, FL, TX — skip those
const existingStates = ['california', 'florida', 'texas'];

const statesDir = path.join(__dirname, 'blog', 'states');
fs.mkdirSync(statesDir, { recursive: true });

function generateStatePage(s) {
  const licenseSection = s.licenseRequired === "not strictly required" || s.licenseRequired === "not strictly required (recommended)" ? `
        <div class="callout" style="background:#e8f5e9;border-left-color:#2e7d32">
            <strong>✅ Good News:</strong> ${s.state} does NOT strictly require a specific license for property management. However, getting a real estate license is recommended for credibility, legal protection, and access to MLS data. Many PM companies choose to get licensed voluntarily.
        </div>

        <h2>Why Get Licensed Anyway?</h2>
        <ul>
            <li><strong>Credibility:</strong> Licensed PMs earn more trust from property owners</li>
            <li><strong>Legal protection:</strong> Operating under a regulatory framework reduces liability</li>
            <li><strong>MLS access:</strong> Licensed agents can list and find properties on MLS</li>
            <li><strong>Competitive advantage:</strong> Stand out from unlicensed competitors</li>
            <li><strong>Expansion:</strong> If you want to add real estate sales services later, you'll already be licensed</li>
        </ul>
  ` : `
        <h2>License Requirements Overview</h2>
        <table>
            <tr><th>Requirement</th><th>Details</th></tr>
            <tr><td>License Type</td><td>${s.licenseRequired}</td></tr>
            <tr><td>Regulatory Authority</td><td>${s.authority}</td></tr>
            <tr><td>Pre-License Education</td><td>${s.coursesRequired}</td></tr>
            <tr><td>State Exam</td><td>${s.examQuestions > 0 ? s.examQuestions + ' questions, ' + s.passingScore + ' passing score' : 'Varies'}</td></tr>
            <tr><td>Estimated Cost</td><td>${s.averageCost}</td></tr>
            <tr><td>Renewal Period</td><td>${s.renewalPeriod}</td></tr>
            ${s.brokerRequired ? '<tr><td>Broker Supervision</td><td>Required (must work under a licensed broker)</td></tr>' : ''}
        </table>

        <h2>Step-by-Step: How to Get Licensed in ${s.state}</h2>
        <ol>
            <li><strong>Complete pre-license education</strong> — ${s.coursesRequired}. Available online through approved providers.</li>
            <li><strong>Pass the state exam</strong> — ${s.examQuestions > 0 ? s.examQuestions + ' questions with a ' + s.passingScore + ' passing score required.' : 'Check with ' + s.authority + ' for current exam details.'}</li>
            <li><strong>Submit your application</strong> — Apply through ${s.authority} with your exam results, fingerprints, and background check.</li>
            <li><strong>Find a sponsoring broker</strong> — ${s.brokerRequired ? 'Required. You must work under a licensed broker until you obtain your own broker license.' : 'Recommended for mentorship and MLS access.'}</li>
            <li><strong>Get your license activated</strong> — Once approved, your license must be activated before you can practice.</li>
        </ol>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Management License ${s.state}: Requirements & How to Get Licensed [2026] | LevelPM</title>
    <meta name="description" content="${s.state} property management license requirements: ${s.licenseRequired}, costs, exam prep, and step-by-step guide for ${s.state} PMs. Updated 2026.">
    <meta name="keywords" content="property management license ${s.state}, ${s.state} property manager license, how to become property manager ${s.state}, ${s.state} PM license requirements">
    <link rel="canonical" href="https://scaledoors.com/blog/states/property-management-license-${s.slug}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="Property Management License ${s.state} [2026 Guide]">
    <meta property="og:description" content="${s.state} PM licensing requirements, costs, and step-by-step guide.">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.7;background:#fafafa}.nav{background:#1a1a2e;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}.nav a{color:#f0c040;text-decoration:none;font-weight:700;font-size:1.2rem}.nav .nav-links a{color:#ccc;font-weight:400;font-size:.95rem;margin-left:1.5rem}.hero{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:4rem 2rem;text-align:center}.hero h1{font-size:2.2rem;max-width:800px;margin:0 auto 1rem;line-height:1.2}.hero .subtitle{color:#aaa;font-size:1.1rem;max-width:600px;margin:0 auto}.content{max-width:780px;margin:0 auto;padding:3rem 2rem}.content h2{font-size:1.6rem;margin:2.5rem 0 1rem;color:#1a1a2e;border-bottom:2px solid #f0c040;padding-bottom:.5rem}.content h3{font-size:1.25rem;margin:2rem 0 .75rem;color:#16213e}.content p{margin-bottom:1.2rem;font-size:1.05rem;color:#333}.content ul,.content ol{margin-bottom:1.2rem;padding-left:1.5rem}.content li{margin-bottom:.5rem;font-size:1.05rem;color:#333}table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:.95rem}th{background:#1a1a2e;color:#fff;padding:.75rem;text-align:left}td{padding:.75rem;border-bottom:1px solid #e0e0e0}tr:nth-child(even){background:#f5f5f5}.callout{background:#fff8e1;border-left:4px solid #f0c040;padding:1.25rem 1.5rem;margin:2rem 0;border-radius:0 8px 8px 0}.cta-box{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:2.5rem;border-radius:12px;text-align:center;margin:3rem 0}.cta-box h3{color:#f0c040;font-size:1.4rem;margin-bottom:1rem}.cta-box p{color:#ccc;margin-bottom:1.5rem}.cta-box .btn{display:inline-block;background:#f0c040;color:#1a1a2e;padding:.8rem 2rem;border-radius:8px;font-weight:700;text-decoration:none;font-size:1.05rem}.breadcrumb{max-width:780px;margin:1rem auto 0;padding:0 2rem;font-size:.85rem;color:#999}.breadcrumb a{color:#2563eb;text-decoration:none}.footer{background:#1a1a2e;color:#999;padding:2rem;text-align:center;font-size:.9rem}.footer a{color:#f0c040;text-decoration:none}.state-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.5rem 0}.state-card{background:#f8f8f8;padding:1rem 1.25rem;border-radius:8px;border:1px solid #e0e0e0}.state-card h4{font-size:1rem;color:#1a1a2e;margin-bottom:.25rem}.state-card p{font-size:.9rem;color:#555;margin:0}@media(max-width:600px){.hero h1{font-size:1.6rem}.state-grid{grid-template-columns:1fr}}</style>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Property Management License ${s.state}: Complete Guide [2026]","author":{"@type":"Organization","name":"LevelPM"},"datePublished":"2026-03-06","dateModified":"2026-03-06"}</script>
    <script defer src="https://va.vercel-scripts.com/v1/script.debug.js" data-endpoint="/_vercel/insights/event"></script>
</head>
<body>
    <nav class="nav"><a href="/">LevelPM</a><div class="nav-links"><a href="/blog">Blog</a><a href="/sops/">Free SOPs</a><a href="/scaling-kit">Scaling Kit</a></div></nav>
    <div class="hero">
        <h1>Property Management License ${s.state}: Complete Guide [2026]</h1>
        <p class="subtitle">Everything you need to know about getting licensed as a property manager in ${s.state}. Requirements, costs, timeline, and tips.</p>
    </div>
    <div class="breadcrumb"><a href="/">Home</a> → <a href="/blog">Blog</a> → PM License ${s.state}</div>

    <article class="content">
        <div class="callout">
            <strong>💡 Key Fact:</strong> ${s.keyFact}
        </div>

        <h2>${s.state} Rental Market Snapshot</h2>
        <div class="state-grid">
            <div class="state-card"><h4>Population</h4><p>${s.population}</p></div>
            <div class="state-card"><h4>Renter Households</h4><p>${s.renters}</p></div>
            <div class="state-card"><h4>Top Cities</h4><p>${s.topCities}</p></div>
            <div class="state-card"><h4>License Required?</h4><p>${s.licenseRequired}</p></div>
        </div>

        ${licenseSection}

        <h2>Cost Breakdown</h2>
        ${s.averageCost !== 'N/A' ? `
        <table>
            <tr><th>Expense</th><th>Estimated Cost</th></tr>
            <tr><td>Pre-license courses</td><td>${s.averageCost.split('-')[0]}-${parseInt(s.averageCost.split('-')[1] || '500')*.6}</td></tr>
            <tr><td>State exam fee</td><td>$50-$100</td></tr>
            <tr><td>License application</td><td>$100-$300</td></tr>
            <tr><td>Background check/fingerprints</td><td>$40-$75</td></tr>
            <tr><td><strong>Total Estimated</strong></td><td><strong>${s.averageCost}</strong></td></tr>
        </table>
        ` : `
        <p>Since ${s.state} doesn't require a specific PM license, there are no mandatory licensing costs. If you choose to get a real estate license voluntarily, expect to spend $500-$1,000 on education, exam fees, and application.</p>
        `}

        <h2>Tips for Success as a Property Manager in ${s.state}</h2>
        <ol>
            <li><strong>Know your local landlord-tenant laws</strong> — ${s.state} has specific regulations that differ from other states. Stay current on security deposit limits, eviction procedures, and fair housing requirements.</li>
            <li><strong>Join your state NARPM chapter</strong> — National Association of Residential Property Managers has local chapters in most states. Great for networking and continuing education.</li>
            <li><strong>Invest in property management software</strong> — Tools like AppFolio, Buildium, or RentManager will help you scale efficiently.</li>
            <li><strong>Build SOPs early</strong> — Standardized processes for maintenance, tenant screening, move-ins, and owner reporting are essential for scaling beyond 50 doors.</li>
            <li><strong>Focus on owner acquisition</strong> — The #1 growth lever for PM companies is getting more property owners to trust you with their properties.</li>
        </ol>

        <div class="cta-box">
            <h3>Ready to Scale Your ${s.state} PM Company?</h3>
            <p>Get our free SOP templates — maintenance triage, move-in/out checklists, and owner reporting templates used by top PM companies.</p>
            <a href="/sops/" class="btn">Download Free SOPs →</a>
        </div>

        <h2>Other State Licensing Guides</h2>
        <p>Looking for property management licensing info in other states? Check out our complete guide library:</p>
        <ul>
            <li><a href="/blog/property-management-license-california">California PM License Guide</a></li>
            <li><a href="/blog/property-management-license-florida">Florida PM License Guide</a></li>
            <li><a href="/blog/property-management-license-texas">Texas PM License Guide</a></li>
            <li><a href="/blog/property-management-certification-guide">Property Management Certification Guide (All States)</a></li>
        </ul>

        <h2>Related Resources</h2>
        <ul>
            <li><a href="/blog/how-to-start-property-management-company">How to Start a Property Management Company</a></li>
            <li><a href="/blog/property-management-checklist-templates">Property Management Checklists & Templates</a></li>
            <li><a href="/blog/property-management-fee-structure-guide">Property Management Fee Structure Guide</a></li>
            <li><a href="/scaling-kit">The PM Scaling Kit — SOPs, Templates & Playbook</a></li>
        </ul>
    </article>

    <footer class="footer">
        <p>© 2026 LevelPM. Built for property managers who want to scale.</p>
        <p><a href="/">Home</a> · <a href="/blog">Blog</a> · <a href="/sops/">Free SOPs</a> · <a href="/scaling-kit">Scaling Kit</a></p>
    </footer>
</body>
</html>`;
}

let count = 0;
for (const s of states) {
  if (existingStates.includes(s.slug)) continue;
  const filePath = path.join(statesDir, `property-management-license-${s.slug}.html`);
  fs.writeFileSync(filePath, generateStatePage(s));
  count++;
}

console.log(`Generated ${count} state pages in ${statesDir}`);

// Generate a state index page
const stateLinks = states.map(s => {
  const url = existingStates.includes(s.slug) 
    ? `/blog/property-management-license-${s.slug}`
    : `/blog/states/property-management-license-${s.slug}`;
  return `<tr><td><a href="${url}">${s.state}</a></td><td>${s.licenseRequired}</td><td>${s.averageCost}</td><td>${s.topCities.split(',')[0]}</td></tr>`;
}).join('\n            ');

const indexPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Management License Requirements by State [2026 Guide] | LevelPM</title>
    <meta name="description" content="Complete guide to property management license requirements in all 50 states + DC. Compare licensing rules, costs, education requirements, and exam details.">
    <meta name="keywords" content="property management license by state, PM license requirements, property manager license, how to get property management license">
    <link rel="canonical" href="https://scaledoors.com/blog/states/">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.7;background:#fafafa}.nav{background:#1a1a2e;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}.nav a{color:#f0c040;text-decoration:none;font-weight:700;font-size:1.2rem}.nav .nav-links a{color:#ccc;font-weight:400;font-size:.95rem;margin-left:1.5rem}.hero{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:4rem 2rem;text-align:center}.hero h1{font-size:2.2rem;max-width:800px;margin:0 auto 1rem;line-height:1.2}.hero .subtitle{color:#aaa;font-size:1.1rem;max-width:600px;margin:0 auto}.content{max-width:900px;margin:0 auto;padding:3rem 2rem}.content h2{font-size:1.6rem;margin:2.5rem 0 1rem;color:#1a1a2e;border-bottom:2px solid #f0c040;padding-bottom:.5rem}.content p{margin-bottom:1.2rem;font-size:1.05rem;color:#333}table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:.95rem}th{background:#1a1a2e;color:#fff;padding:.75rem;text-align:left;position:sticky;top:0}td{padding:.75rem;border-bottom:1px solid #e0e0e0}td a{color:#2563eb;text-decoration:none;font-weight:600}td a:hover{text-decoration:underline}tr:nth-child(even){background:#f5f5f5}.cta-box{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:2.5rem;border-radius:12px;text-align:center;margin:3rem 0}.cta-box h3{color:#f0c040;font-size:1.4rem;margin-bottom:1rem}.cta-box p{color:#ccc;margin-bottom:1.5rem}.cta-box .btn{display:inline-block;background:#f0c040;color:#1a1a2e;padding:.8rem 2rem;border-radius:8px;font-weight:700;text-decoration:none;font-size:1.05rem}.footer{background:#1a1a2e;color:#999;padding:2rem;text-align:center;font-size:.9rem}.footer a{color:#f0c040;text-decoration:none}@media(max-width:600px){.hero h1{font-size:1.6rem}table{font-size:.85rem}}</style>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Property Management License Requirements by State [2026]","author":{"@type":"Organization","name":"LevelPM"},"datePublished":"2026-03-06"}</script>
    <script defer src="https://va.vercel-scripts.com/v1/script.debug.js" data-endpoint="/_vercel/insights/event"></script>
</head>
<body>
    <nav class="nav"><a href="/">LevelPM</a><div class="nav-links"><a href="/blog">Blog</a><a href="/sops/">Free SOPs</a><a href="/scaling-kit">Scaling Kit</a></div></nav>
    <div class="hero">
        <h1>Property Management License Requirements by State [2026]</h1>
        <p class="subtitle">Compare PM licensing requirements, costs, and education hours across all 50 states. Find your state and get started.</p>
    </div>

    <article class="content">
        <p>Property management licensing requirements vary significantly by state. Some states require a full real estate broker's license, others have dedicated PM licenses, and a few states don't require any license at all. This guide covers every state so you know exactly what you need.</p>
        
        <h2>All 50 States + DC</h2>
        <table>
            <tr><th>State</th><th>License Required</th><th>Estimated Cost</th><th>Major Market</th></tr>
            ${stateLinks}
        </table>

        <div class="cta-box">
            <h3>Already Licensed? Ready to Scale?</h3>
            <p>Get our free SOP templates and start systemizing your PM company. Used by property managers across all 50 states.</p>
            <a href="/sops/" class="btn">Download Free SOPs →</a>
        </div>

        <h2>Key Takeaways</h2>
        <ul style="list-style:none;padding:0">
            <li style="padding:.5rem 0;font-size:1.05rem">✅ <strong>Most states</strong> require a real estate license for property management</li>
            <li style="padding:.5rem 0;font-size:1.05rem">✅ <strong>Oregon, Utah, Nevada, South Carolina</strong> have dedicated PM licenses</li>
            <li style="padding:.5rem 0;font-size:1.05rem">✅ <strong>Indiana, Montana, South Dakota, Vermont, Wyoming</strong> don't strictly require a license</li>
            <li style="padding:.5rem 0;font-size:1.05rem">✅ <strong>California</strong> requires a broker's license (highest bar)</li>
            <li style="padding:.5rem 0;font-size:1.05rem">✅ <strong>Average cost</strong> to get licensed: $500-$1,200 depending on state</li>
        </ul>

        <h2>Related Guides</h2>
        <ul>
            <li><a href="/blog/property-management-certification-guide">Property Management Certification Guide</a></li>
            <li><a href="/blog/how-to-start-property-management-company">How to Start a Property Management Company</a></li>
            <li><a href="/blog/property-management-fee-structure-guide">Fee Structure Guide</a></li>
        </ul>
    </article>

    <footer class="footer">
        <p>© 2026 LevelPM. Built for property managers who want to scale.</p>
        <p><a href="/">Home</a> · <a href="/blog">Blog</a> · <a href="/sops/">Free SOPs</a> · <a href="/scaling-kit">Scaling Kit</a></p>
    </footer>
</body>
</html>`;

fs.writeFileSync(path.join(statesDir, 'index.html'), indexPage);
console.log('Generated state index page');

// Output sitemap entries
console.log('\nSitemap entries:');
for (const s of states) {
  if (existingStates.includes(s.slug)) continue;
  console.log(`https://scaledoors.com/blog/states/property-management-license-${s.slug}`);
}
