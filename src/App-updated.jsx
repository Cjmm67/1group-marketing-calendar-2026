import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Calendar, Filter, Plus, Edit, Trash2, ChevronDown, ChevronUp, Star, Flame, Snowflake, X, Search, Copy, RotateCcw, Eye, EyeOff, BarChart3, Grid3X3, Layers, MapPin, Users, GraduationCap, Megaphone, ChevronLeft, ChevronRight, Check, AlertTriangle, Zap, TrendingUp } from "lucide-react";

// ─── EMBEDDED DATA ───

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QUARTERS = { q1:[0,1,2], q2:[3,4,5], q3:[6,7,8], q4:[9,10,11] };

// Daily hot/cold: "day:count:rating" per month
const HC_RAW = {
  "2026-01":"1:3:cc,2:0:cc,3:11:h,4:5:c,5:0:cc,6:1:cc,7:2:cc,8:0:cc,9:3:cc,10:16:hh,11:10:h,12:0:cc,13:0:cc,14:0:cc,15:1:cc,16:8:h,17:17:hh,18:5:c,19:1:cc,20:3:cc,21:2:cc,22:6:h,23:3:cc,24:9:h,25:6:h,26:0:cc,27:1:cc,28:1:cc,29:3:cc,30:1:cc,31:18:hh",
  "2026-02":"1:4:c,2:2:cc,3:6:h,4:2:cc,5:6:h,6:2:cc,7:17:hh,8:6:h,9:1:cc,10:2:cc,11:4:c,12:3:cc,13:2:cc,14:2:cc,15:0:cc,16:1:cc,17:0:cc,18:0:cc,19:0:cc,20:1:cc,21:0:cc,22:6:h,23:4:c,24:3:cc,25:4:c,26:5:c,27:7:h,28:14:h",
  "2026-03":"1:5:c,2:1:cc,3:3:cc,4:5:c,5:4:c,6:3:cc,7:9:h,8:7:h,9:3:cc,10:1:cc,11:1:cc,12:5:c,13:0:cc,14:12:h,15:9:h,16:1:cc,17:0:cc,18:0:cc,19:2:cc,20:0:cc,21:19:hh,22:10:h,23:1:cc,24:2:cc,25:2:cc,26:1:cc,27:2:cc,28:22:hh,29:4:c,30:0:cc,31:0:cc",
  "2026-04":"1:1:cc,2:1:cc,3:1:cc,4:3:cc,5:1:cc,6:0:cc,7:0:cc,8:0:cc,9:1:cc,10:1:cc,11:5:c,12:7:h,13:0:cc,14:0:cc,15:0:cc,16:3:cc,17:1:cc,18:12:h,19:2:cc,20:0:cc,21:2:cc,22:1:cc,23:3:cc,24:3:cc,25:13:h,26:9:h,27:1:cc,28:1:cc,29:0:cc,30:0:cc",
  "2026-05":"1:2:cc,2:8:h,3:2:cc,4:1:cc,5:0:cc,6:1:cc,7:0:cc,8:0:cc,9:11:h,10:0:cc,11:0:cc,12:1:cc,13:2:cc,14:0:cc,15:0:cc,16:13:h,17:7:h,18:0:cc,19:0:cc,20:0:cc,21:0:cc,22:0:cc,23:9:h,24:12:h,25:0:cc,26:0:cc,27:1:cc,28:1:cc,29:1:cc,30:17:hh,31:7:h",
  "2026-06":"1:0:cc,2:0:cc,3:1:cc,4:2:cc,5:1:cc,6:17:hh,7:5:c,8:3:cc,9:0:cc,10:1:cc,11:0:cc,12:1:cc,13:6:h,14:15:hh,15:0:cc,16:0:cc,17:0:cc,18:0:cc,19:0:cc,20:19:hh,21:6:h,22:0:cc,23:1:cc,24:2:cc,25:1:cc,26:5:c,27:9:h,28:9:h,29:0:cc,30:0:cc",
  "2026-07":"1:0:cc,2:0:cc,3:0:cc,4:9:h,5:6:h,6:0:cc,7:0:cc,8:0:cc,9:0:cc,10:1:cc,11:19:hh,12:5:c,13:0:cc,14:0:cc,15:0:cc,16:0:cc,17:0:cc,18:20:hh,19:4:c,20:0:cc,21:0:cc,22:0:cc,23:0:cc,24:0:cc,25:16:hh,26:6:h,27:0:cc,28:0:cc,29:0:cc,30:0:cc,31:1:cc",
  "2026-08":"1:16:hh,2:5:c,3:0:cc,4:0:cc,5:0:cc,6:1:cc,7:0:cc,8:16:hh,9:0:cc,10:0:cc,11:0:cc,12:0:cc,13:0:cc,14:0:cc,15:5:c,16:2:cc,17:0:cc,18:0:cc,19:0:cc,20:0:cc,21:0:cc,22:1:cc,23:3:cc,24:1:cc,25:0:cc,26:0:cc,27:0:cc,28:0:cc,29:1:cc,30:1:cc,31:0:cc",
  "2026-09":"1:0:cc,2:0:cc,3:0:cc,4:0:cc,5:4:c,6:2:cc,7:0:cc,8:0:cc,9:0:cc,10:0:cc,11:0:cc,12:25:hh,13:2:cc,14:0:cc,15:0:cc,16:0:cc,17:0:cc,18:0:cc,19:20:hh,20:4:c,21:0:cc,22:0:cc,23:0:cc,24:0:cc,25:0:cc,26:16:hh,27:7:h,28:0:cc,29:0:cc,30:1:cc",
  "2026-10":"1:0:cc,2:0:cc,3:25:hh,4:2:cc,5:0:cc,6:0:cc,7:0:cc,8:1:cc,9:1:cc,10:22:hh,11:10:h,12:0:cc,13:0:cc,14:0:cc,15:0:cc,16:0:cc,17:13:h,18:5:c,19:0:cc,20:0:cc,21:0:cc,22:0:cc,23:0:cc,24:15:hh,25:12:h,26:3:cc,27:0:cc,28:0:cc,29:0:cc,30:0:cc,31:16:hh",
  "2026-11":"1:20:hh,2:0:cc,3:0:cc,4:0:cc,5:0:cc,6:0:cc,7:15:hh,8:10:h,9:0:cc,10:0:cc,11:0:cc,12:0:cc,13:0:cc,14:19:hh,15:4:c,16:1:cc,17:0:cc,18:0:cc,19:1:cc,20:2:cc,21:18:hh,22:19:hh,23:1:cc,24:0:cc,25:0:cc,26:0:cc,27:0:cc,28:19:hh,29:5:c,30:0:cc",
  "2026-12":"1:0:cc,2:0:cc,3:0:cc,4:0:cc,5:11:h,6:10:h,7:0:cc,8:0:cc,9:0:cc,10:0:cc,11:0:cc,12:19:hh,13:3:cc,14:0:cc,15:0:cc,16:0:cc,17:0:cc,18:1:cc,19:9:h,20:8:h,21:1:cc,22:0:cc,23:0:cc,24:1:cc,25:0:cc,26:4:c,27:3:cc,28:1:cc,29:0:cc,30:0:cc,31:0:cc"
};

function parseHC() {
  const result = {};
  for (const [month, raw] of Object.entries(HC_RAW)) {
    const mi = parseInt(month.split("-")[1]) - 1;
    raw.split(",").forEach(item => {
      const [d, c, r] = item.split(":");
      const key = `2026-${String(mi+1).padStart(2,"0")}-${d.padStart(2,"0")}`;
      result[key] = { count: parseInt(c), rating: r === "hh" ? "hot-hot" : r === "h" ? "hot" : r === "c" ? "cold" : "cold-cold" };
    });
  }
  return result;
}

const DAILY_HC = parseHC();

const MICE_EVENTS = [
  {id:"mice-1",name:"Carbon Forward Asia 2026",start:"2026-03-24",end:"2026-03-25",cat:"Trade Conferences",layer:"mice"},
  {id:"mice-2",name:"APTS-SOHNSS 2026",start:"2026-04-09",end:"2026-04-12",cat:"Association Conventions",layer:"mice"},
  {id:"mice-3",name:"GITEX AI ASIA",start:"2026-04-09",end:"2026-04-10",cat:"Exhibitions, Innovation & Technology",layer:"mice"},
  {id:"mice-4",name:"World Ageing Festival 2026",start:"2026-04-14",end:"2026-04-15",cat:"Association Conventions",layer:"mice"},
  {id:"mice-5",name:"IDEM 2026",start:"2026-04-17",end:"2026-04-19",cat:"Exhibitions, Trade Conferences",layer:"mice"},
  {id:"mice-6",name:"Singapore Maritime Week 2026",start:"2026-04-20",end:"2026-04-24",cat:"Maritime",layer:"mice"},
  {id:"mice-7",name:"Food & Hospitality Asia 2026",start:"2026-04-21",end:"2026-04-24",cat:"Exhibitions, Lifestyle",layer:"mice"},
  {id:"mice-8",name:"LNGA 2026",start:"2026-04-21",end:"2026-04-22",cat:"Trade Conferences",layer:"mice"},
  {id:"mice-9",name:"MTX (Milipol TechX) 2026",start:"2026-04-28",end:"2026-04-30",cat:"Exhibitions",layer:"mice"},
  {id:"mice-10",name:"HealthTechX Asia 2026",start:"2026-05-06",end:"2026-05-07",cat:"Exhibitions, Health Tech",layer:"mice"},
  {id:"mice-11",name:"Ahrefs Evolve Singapore 2026",start:"2026-05-14",end:"2026-05-14",cat:"Trade Conferences, Tech",layer:"mice"},
  {id:"mice-12",name:"Ecosperity Week 2026",start:"2026-05-18",end:"2026-05-21",cat:"Exhibitions",layer:"mice"},
  {id:"mice-13",name:"RECHARGE Wind Power Summit 2026",start:"2026-05-19",end:"2026-05-20",cat:"Energy",layer:"mice"},
  {id:"mice-14",name:"Asia Tech X (ATX) Singapore 2026",start:"2026-05-20",end:"2026-05-22",cat:"Exhibitions, Tech",layer:"mice"},
  {id:"mice-15",name:"World Cities Summit 2026",start:"2026-06-14",end:"2026-06-16",cat:"Urban Solutions",layer:"mice"},
  {id:"mice-16",name:"Singapore Intl Water Week 2026",start:"2026-06-15",end:"2026-06-19",cat:"Urban Solutions",layer:"mice"},
  {id:"mice-17",name:"ITIC APAC 2026",start:"2026-06-15",end:"2026-06-17",cat:"Exhibitions",layer:"mice"},
  {id:"mice-18",name:"Herbalife Extravaganza 2026",start:"2026-06-18",end:"2026-06-22",cat:"Meeting & Incentive Travel",layer:"mice"},
  {id:"mice-19",name:"Tech Week Singapore 2026",start:"2026-09-09",end:"2026-09-11",cat:"Exhibitions, Tech",layer:"mice"},
  {id:"mice-20",name:"Medical Fair Asia 2026",start:"2026-09-09",end:"2026-09-11",cat:"Applied Health Sciences",layer:"mice"},
  {id:"mice-21",name:"Milken Institute Asia Summit 2026",start:"2026-10-07",end:"2026-10-09",cat:"Exhibitions",layer:"mice"},
  {id:"mice-22",name:"Industrial Transformation ASIA-PACIFIC 2026",start:"2026-10-21",end:"2026-10-23",cat:"Advanced Manufacturing",layer:"mice"},
  {id:"mice-23",name:"ITB Asia",start:"2026-10-21",end:"2026-10-23",cat:"Travel & Tourism",layer:"mice"},
  {id:"mice-24",name:"Singapore Intl Energy Week 2026",start:"2026-10-26",end:"2026-10-30",cat:"Energy",layer:"mice"},
  {id:"mice-25",name:"Legal Innovation Festival SE Asia",start:"2026-11-04",end:"2026-11-06",cat:"Legal Tech",layer:"mice"},
  {id:"mice-26",name:"APOC 2026",start:"2026-11-06",end:"2026-11-08",cat:"Dental/Medical",layer:"mice"},
  {id:"mice-27",name:"Singapore FinTech Festival 2026",start:"2026-11-18",end:"2026-11-20",cat:"Financial Services",layer:"mice"},
];

// SG Events - key highlights (condensed from 134, showing major ones)
const SG_EVENTS_RAW = [
  {m:"Jan",d:"02-03",n:"SINGLAND FESTIVAL - NE-YO & Intl Artists",v:"Marina Bay Sands",t:"Concert"},
  {m:"Jan",d:"02-03",n:"Super Junior Super Show 10",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Jan",d:"04",n:"Air Supply 50th Anniversary Tour",v:"MBS Grand Ballroom",t:"Concert"},
  {m:"Jan",d:"08-11",n:"Singapore Motorshow 2026",v:"Suntec Convention Centre",t:"Trade Show"},
  {m:"Jan",d:"17-18",n:"Tomorrow X Together (TXT) Concert",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Jan",d:"23-25",n:"Art SG Contemporary Art Fair 2026",v:"Marina Bay Sands",t:"Art Exhibition"},
  {m:"Jan",d:"13-14",n:"Mediterranean Food & Wine B2B",v:"Suntec",t:"Trade Show"},
  {m:"Feb",d:"03-08",n:"Singapore Airshow 2026",v:"Changi Exhibition Centre",t:"Trade Show"},
  {m:"Feb",d:"02-04",n:"Augmented World Expo",v:"Singapore Expo",t:"Technology Expo"},
  {m:"Feb",d:"06-22",n:"Cirque Du Soleil - KOOZA",v:"Bayfront Event Space",t:"Entertainment"},
  {m:"Feb",d:"25-26",n:"Aviation Festival Asia",v:"Suntec",t:"Conference"},
  {m:"Feb",d:"04-06",n:"Asia Photonics Expo (APE 2026)",v:"Marina Bay Sands",t:"Technology Expo"},
  {m:"Mar",d:"12",n:"COMEX / IT SHOW",v:"Suntec Singapore",t:"Technology Expo"},
  {m:"Mar",d:"24-26",n:"BuildTech Asia 2026",v:"Singapore Expo",t:"Trade Show"},
  {m:"Mar",d:"25-27",n:"Asia Pacific Maritime (APM)",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Mar",d:"31",n:"GEO Connect Asia",v:"Marina Bay Sands",t:"Conference"},
  {m:"Mar",d:"05",n:"ZAK SALAAM INDIA Expo",v:"Singapore Expo",t:"Trade Show"},
  {m:"Mar",d:"31",n:"Digital Construction Asia",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Apr",d:"03-12",n:"ARTBOX CAMP 2026",v:"Singapore EXPO",t:"Creative Festival"},
  {m:"Apr",d:"09-11",n:"GITEX ASIA x AI Everything 2026",v:"Marina Bay Sands",t:"Technology Expo"},
  {m:"Apr",d:"17-19",n:"IDEM Singapore - Dental Exhibition",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Apr",d:"20-24",n:"Beauty Asia 2026",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Apr",d:"21-24",n:"FHA-HoReCa",v:"Singapore Expo",t:"Trade Show"},
  {m:"Apr",d:"21-24",n:"Black Hat Asia",v:"Marina Bay Sands",t:"Security Conference"},
  {m:"Apr",d:"21-24",n:"ProWine Asia",v:"Singapore Expo",t:"Trade Show"},
  {m:"Apr",d:"14-15",n:"World Ageing Festival",v:"Singapore Expo",t:"Conference"},
  {m:"May",d:"04-07",n:"HR Tech Asia",v:"Suntec",t:"Technology Expo"},
  {m:"May",d:"10-14",n:"TFWA Asia Pacific",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"May",d:"19-22",n:"ATxSG / CommunicAsia / BroadcastAsia",v:"Singapore Expo",t:"Technology Expo"},
  {m:"May",d:"20-22",n:"The AI Summit Singapore 2026",v:"Singapore Expo",t:"Technology Summit"},
  {m:"May",d:"29",n:"Singapore Food Expo",v:"Singapore Expo",t:"Consumer Expo"},
  {m:"Jun",d:"01-04",n:"World Aquaculture Singapore",v:"Singapore Expo",t:"Conference"},
  {m:"Jun",d:"13",n:"(G)I-DLE Concert",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Jun",d:"14-16",n:"World Cities Summit",v:"Suntec",t:"Conference"},
  {m:"Jun",d:"15-19",n:"Singapore Intl Water Week (SIWW)",v:"Marina Bay Sands",t:"Conference"},
  {m:"Jun",d:"29",n:"ILTM Asia Pacific",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Jul",d:"09-12",n:"Singapore Intl Jewellery Expo (SIJE)",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Jul",d:"15-17",n:"SIGEP Asia",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Jul",d:"15-17",n:"Speciality Coffee & Tea Asia",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Aug",d:"26-27",n:"The Business Show Asia",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Sep",d:"02-04",n:"Seafood Expo Asia",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Sep",d:"09-11",n:"Medical Fair Asia",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Sep",d:"22-24",n:"MRO Asia Pacific",v:"Singapore Expo",t:"Trade Show"},
  {m:"Sep",d:"29-30",n:"Tech Week Singapore",v:"TBD",t:"Technology Conference"},
  {m:"Oct",d:"09-11",n:"⭐ F1 SINGAPORE GRAND PRIX 2026",v:"Marina Bay Street Circuit",t:"Sporting Event"},
  {m:"Oct",d:"09-11",n:"F1 Concert Series & Entertainment",v:"Marina Bay / Padang",t:"Concert"},
  {m:"Oct",d:"11-12",n:"TWICE Concert",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Oct",d:"18-19",n:"NCT Dream Concert",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Oct",d:"21-23",n:"ITB Asia / MICE Show Asia 2026",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Oct",d:"22-24",n:"Food Japan",v:"Suntec City",t:"Food Expo"},
  {m:"Nov",d:"18-20",n:"Singapore FinTech Festival 2026",v:"Singapore EXPO",t:"Festival"},
  {m:"Nov",d:"24-26",n:"OSEA - Offshore Energy Week",v:"Marina Bay Sands",t:"Conference"},
  {m:"Nov",d:"29-30",n:"BLACKPINK Concert",v:"National Stadium",t:"Concert"},
  {m:"Dec",d:"17",n:"⭐ BTS World Tour (Day 1)",v:"National Stadium",t:"Concert"},
  {m:"Dec",d:"19",n:"⭐ BTS World Tour (Day 2)",v:"National Stadium",t:"Concert"},
  {m:"Dec",d:"20",n:"⭐ BTS World Tour (Day 3)",v:"National Stadium",t:"Concert"},
  {m:"Dec",d:"22",n:"⭐ BTS World Tour (Day 4)",v:"National Stadium",t:"Concert"},
];

const SG_EVENTS = SG_EVENTS_RAW.map((e, i) => ({
  id: `sg-${i}`, name: e.n, month: MONTH_SHORT.indexOf(e.m), dateStr: e.d,
  venue: e.v, type: e.t, layer: "sg",
  start: parseDateStr(e.m, e.d, true), end: parseDateStr(e.m, e.d, false),
}));

function parseDateStr(m, d, isStart) {
  const mi = MONTH_SHORT.indexOf(m);
  const parts = d.replace(/ *\(.*\)/, "").split("-");
  const day = parseInt(parts[isStart ? 0 : parts.length - 1]) || 1;
  return `2026-${String(mi + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const VISITOR_DATA = [
  {market:"Mainland China",arrivals:"3.1M +3%",data:{Jan:"Mod",Feb:"Peak",Mar:"Mod",Apr:"Low",May:"Low",Jun:"Mod",Jul:"Mod",Aug:"Mod",Sep:"Low",Oct:"Peak",Nov:"High",Dec:"Mod"}},
  {market:"Indonesia",arrivals:"2.4M stable",data:{Jan:"High",Feb:"High",Mar:"Peak",Apr:"Mod",May:"Mod",Jun:"High",Jul:"Peak",Aug:"High",Sep:"Mod",Oct:"Mod",Nov:"High",Dec:"High"}},
  {market:"Malaysia",arrivals:"1.3M +8%",data:{Jan:"High",Feb:"Peak",Mar:"Mod",Apr:"Mod",May:"Mod",Jun:"High",Jul:"Peak",Aug:"High",Sep:"Mod",Oct:"Mod",Nov:"High",Dec:"Peak"}},
  {market:"Australia",arrivals:"1.3M +8%",data:{Jan:"Peak",Feb:"High",Mar:"Mod",Apr:"Low",May:"Low",Jun:"Mod",Jul:"Peak",Aug:"Peak",Sep:"Mod",Oct:"Mod",Nov:"Mod",Dec:"High"}},
  {market:"India",arrivals:"1.2M stable",data:{Jan:"Mod",Feb:"Mod",Mar:"Mod",Apr:"Mod",May:"Mod",Jun:"High",Jul:"Peak",Aug:"Peak",Sep:"Mod",Oct:"High",Nov:"Peak",Dec:"High"}},
  {market:"Japan",arrivals:"~630K +10%",data:{Jan:"Mod",Feb:"Mod",Mar:"High",Apr:"Mod",May:"Peak",Jun:"Mod",Jul:"Peak",Aug:"High",Sep:"Peak",Oct:"Mod",Nov:"Mod",Dec:"Mod"}},
  {market:"Philippines",arrivals:"726K -7%",data:{Jan:"Mod",Feb:"Mod",Mar:"Mod",Apr:"High",May:"Mod",Jun:"High",Jul:"Peak",Aug:"Peak",Sep:"Mod",Oct:"Mod",Nov:"High",Dec:"High"}},
  {market:"USA",arrivals:"~720K +4%",data:{Jan:"Mod",Feb:"Low",Mar:"Low",Apr:"Mod",May:"Mod",Jun:"High",Jul:"Peak",Aug:"Peak",Sep:"Mod",Oct:"Mod",Nov:"Mod",Dec:"High"}},
  {market:"South Korea",arrivals:"~610K stable",data:{Jan:"Mod",Feb:"Peak",Mar:"Low",Apr:"Mod",May:"Mod",Jun:"Mod",Jul:"Peak",Aug:"High",Sep:"Mod",Oct:"High",Nov:"Mod",Dec:"Mod"}},
  {market:"United Kingdom",arrivals:"~590K stable",data:{Jan:"Low",Feb:"Low",Mar:"Mod",Apr:"High",May:"Mod",Jun:"High",Jul:"Peak",Aug:"Peak",Sep:"Mod",Oct:"Mod",Nov:"Low",Dec:"High"}},
];

const SCHOOL_HOLIDAYS = [
  {name:"Term 1 Break",start:"2026-03-14",end:"2026-03-22"},
  {name:"Mid-Year Holidays",start:"2026-05-30",end:"2026-06-28"},
  {name:"Term 3 Break",start:"2026-09-05",end:"2026-09-13"},
  {name:"Year-End Holidays",start:"2026-11-21",end:"2026-12-31"},
];

const PUBLIC_HOLIDAYS = [
  {name:"New Year's Day",date:"2026-01-01"},
  {name:"Chinese New Year",date:"2026-02-17"},
  {name:"Chinese New Year (Day 2)",date:"2026-02-18"},
  {name:"Hari Raya Puasa",date:"2026-03-21"},
  {name:"Good Friday",date:"2026-04-03"},
  {name:"Labour Day",date:"2026-05-01"},
  {name:"Hari Raya Haji",date:"2026-05-27"},
  {name:"Vesak Day",date:"2026-05-31"},
  {name:"National Day",date:"2026-08-09"},
  {name:"Deepavali",date:"2026-11-08"},
  {name:"Christmas Day",date:"2026-12-25"},
];

const CAMPAIGNS = [
  {id:"camp-1",name:"Wellness: Rise & Brunch",month:0,tagline:"New Year, New Heights",layer:"campaign"},
  {id:"camp-2",name:"Sip & Savour",month:1,tagline:"A World in Every Glass",layer:"campaign"},
  {id:"camp-3",name:"She Unfolds",month:2,tagline:"Every Layer Tells a Story",layer:"campaign"},
  {id:"camp-4",name:"21st Anniversary Launch",month:3,tagline:"",layer:"campaign"},
  {id:"camp-5",name:"Flavours of the World Pop-Up",month:3,tagline:"",layer:"campaign"},
  {id:"camp-6",name:"Summertime Madness",month:5,tagline:"",layer:"campaign"},
  {id:"camp-7",name:"Summer Goals",month:5,tagline:"",layer:"campaign"},
  {id:"camp-8",name:"Let's Go Local! / Born & Bred",month:7,tagline:"",layer:"campaign"},
  {id:"camp-9",name:"Oktoberfest",month:8,tagline:"",layer:"campaign"},
  {id:"camp-10",name:"Festive Season Launch",month:10,tagline:"",layer:"campaign"},
  {id:"camp-11",name:"New Year's Eve Countdown",month:11,tagline:"",layer:"campaign"},
];

// ─── OUTLET VENUES & OUTLET-LEVEL CAMPAIGNS ───
// Venues listed here populate the venue filter dropdown.
// Outlet events are outlet-specific activations & tactical promotions
// distinct from group-wide CAMPAIGNS. Duplicates with group campaigns
// (e.g. Wellness, Sip & Savour, Let's Go Local, Oktoberfest, Festive, NYE)
// are intentionally skipped per "don't duplicate" rule.

const VENUES = [
  "1-Altitude",
  "1-Altitude Coast",
  "Monti",
  "Alkaff Mansion",
  "1-Arden",
  "Oumi",
  "Kaarla",
  "Sol & Ora",
  "Camille",
  "1-Flowerhill",
  "1-Host",
];

const OUTLET_EVENTS = [
  // ─── 1-Altitude Coast (Jan–Feb 2026 portion of Mar25–Feb26 plan) ───
  {id:"out-ac-1",name:"Valentine's Day",start:"2026-02-14",end:"2026-02-14",venue:"1-Altitude Coast",type:"Activation",layer:"outlet"},
  {id:"out-ac-2",name:"World Bartender Day",start:"2026-02-24",end:"2026-02-24",venue:"1-Altitude Coast",type:"Tactical Promotion",layer:"outlet"},

  // ─── Sol & Ora (Mar–Dec 2026 portion of Mar26–Feb27 plan) ───
  // Activations
  {id:"out-so-1",name:"Easter Family Day",start:"2026-04-05",end:"2026-04-05",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-2",name:"SG Restaurant Week (Spring)",start:"2026-03-27",end:"2026-04-05",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-3",name:"Mother's Day",start:"2026-05-10",end:"2026-05-10",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-4",name:"Father's Day",start:"2026-06-21",end:"2026-06-21",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-5",name:"June School Holidays Family Day",start:"2026-06-13",end:"2026-06-13",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-6",name:"Brunch Day Party",start:"2026-07-12",end:"2026-07-12",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-7",name:"Family Day",start:"2026-08-09",end:"2026-08-09",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-8",name:"GPSS",start:"2026-10-09",end:"2026-10-11",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-9",name:"SG Restaurant Week (Autumn)",start:"2026-10-16",end:"2026-10-25",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-10",name:"Family Day (November)",start:"2026-11-14",end:"2026-11-14",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  {id:"out-so-11",name:"Christmas",start:"2026-12-25",end:"2026-12-25",venue:"Sol & Ora",type:"Activation",layer:"outlet"},
  // Tactical Promotions
  {id:"out-so-12",name:"International Women's Day",start:"2026-03-08",end:"2026-03-08",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-13",name:"World Malbec Day",start:"2026-04-17",end:"2026-04-17",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-14",name:"International Cheese Day",start:"2026-06-04",end:"2026-06-04",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-15",name:"Bastille Day",start:"2026-07-14",end:"2026-07-14",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-16",name:"Wine & Cheese Day",start:"2026-07-25",end:"2026-07-25",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-17",name:"Crypto Week",start:"2026-09-14",end:"2026-09-18",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-18",name:"Spain's National Day",start:"2026-10-12",end:"2026-10-12",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
  {id:"out-so-19",name:"World Pasta Day",start:"2026-10-25",end:"2026-10-25",venue:"Sol & Ora",type:"Tactical Promotion",layer:"outlet"},
];

// ─── COLOURS ───

const LAYER_COLORS = {
  "hot-hot": { primary: "#DC2626", bg: "#FEE2E2", text: "#fff" },
  "hot": { primary: "#EF4444", bg: "#FEE2E2", text: "#fff" },
  "cold": { primary: "#60A5FA", bg: "#DBEAFE", text: "#fff" },
  "cold-cold": { primary: "#2563EB", bg: "#DBEAFE", text: "#fff" },
  mice: { primary: "#8B5CF6", bg: "#EDE9FE", text: "#fff" },
  sg: { primary: "#F59E0B", bg: "#FEF3C7", text: "#000" },
  visitor: { primary: "#10B981", bg: "#D1FAE5", text: "#fff" },
  school: { primary: "#14B8A6", bg: "#CCFBF1", text: "#fff" },
  ph: { primary: "#EAB308", bg: "#FEF9C3", text: "#000" },
  campaign: { primary: "#EC4899", bg: "#FCE7F3", text: "#fff" },
  outlet: { primary: "#F43F5E", bg: "#FFE4E6", text: "#fff" },
};

const INTENSITY_COLORS = { Peak: "#059669", High: "#10B981", Mod: "#6EE7B7", Low: "#D1FAE5" };

// ─── HELPERS ───

function isInRange(date, start, end) {
  return date >= start && date <= end;
}

function isSchoolHoliday(dateStr) {
  return SCHOOL_HOLIDAYS.some(h => isInRange(dateStr, h.start, h.end));
}

function isPublicHoliday(dateStr) {
  return PUBLIC_HOLIDAYS.find(h => h.date === dateStr);
}

function getMonthIndex(dateStr) {
  return parseInt(dateStr.split("-")[1]) - 1;
}

function getQuarter(mi) {
  if (mi < 3) return "q1";
  if (mi < 6) return "q2";
  if (mi < 9) return "q3";
  return "q4";
}

function daysInMonth(mi) {
  return new Date(2026, mi + 1, 0).getDate();
}

function firstDayOfMonth(mi) {
  return new Date(2026, mi, 1).getDay(); // 0=Sun
}

function dateStr(mi, d) {
  return `2026-${String(mi + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getVisitorPeaks(mi) {
  const monthKey = MONTH_SHORT[mi];
  return VISITOR_DATA.filter(v => v.data[monthKey] === "Peak").map(v => v.market);
}

// ─── MAIN COMPONENT ───

export default function MarketingCalendar() {
  const [view, setView] = useState("board"); // board | month | heatmap
  const [quarter, setQuarter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [search, setSearch] = useState("");
  const [layers, setLayers] = useState({
    hotcold: true, mice: true, sg: true, visitor: true, school: true, campaign: true, outlet: true,
  });
  const [detailItem, setDetailItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customEvents, setCustomEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const saved = await window.storage.get("calendar-events");
        if (saved?.value) setCustomEvents(JSON.parse(saved.value));
        const prefs = await window.storage.get("calendar-settings");
        if (prefs?.value) {
          const p = JSON.parse(prefs.value);
          if (p.layers) setLayers({ outlet: true, ...p.layers });
          if (p.view) setView(p.view);
          if (p.quarter) setQuarter(p.quarter);
          if (p.venue) setSelectedVenue(p.venue);
        }
      } catch (e) { /* first load */ }
      setLoaded(true);
    })();
  }, []);

  // Save
  const saveEvents = useCallback(async (evts) => {
    setCustomEvents(evts);
    try { await window.storage.set("calendar-events", JSON.stringify(evts)); } catch {}
  }, []);

  const savePrefs = useCallback(async (l, v, q, ven) => {
    try { await window.storage.set("calendar-settings", JSON.stringify({ layers: l, view: v, quarter: q, venue: ven })); } catch {}
  }, []);

  const toggleLayer = (key) => {
    const next = { ...layers, [key]: !layers[key] };
    setLayers(next);
    savePrefs(next, view, quarter, selectedVenue);
  };

  // All events combined
  const allEvents = useMemo(() => {
    const events = [];
    // MICE
    if (layers.mice) events.push(...MICE_EVENTS);
    // SG
    if (layers.sg) events.push(...SG_EVENTS);
    // Campaigns
    if (layers.campaign) events.push(...CAMPAIGNS.map(c => ({
      ...c, start: `2026-${String(c.month + 1).padStart(2, "0")}-01`,
      end: `2026-${String(c.month + 1).padStart(2, "0")}-28`,
    })));
    // Outlet campaigns (venue-specific activations & tactical promotions)
    if (layers.outlet) events.push(...OUTLET_EVENTS);
    // Custom
    events.push(...customEvents);
    return events;
  }, [layers, customEvents]);

  const filteredEvents = useMemo(() => {
    let evts = allEvents;
    // Venue filter — applies ONLY to venue-tagged events (OUTLET_EVENTS + custom with venue).
    // Group-level layers (MICE, SG, Campaigns) always stay visible as context.
    if (selectedVenue !== "all") {
      evts = evts.filter(e => !e.venue || e.venue === selectedVenue);
    }
    if (search) {
      const s = search.toLowerCase();
      evts = evts.filter(e => e.name?.toLowerCase().includes(s) || e.cat?.toLowerCase().includes(s) || e.type?.toLowerCase().includes(s) || e.venue?.toLowerCase().includes(s));
    }
    if (quarter !== "all") {
      const months = QUARTERS[quarter];
      evts = evts.filter(e => {
        if (e.month !== undefined) return months.includes(e.month);
        if (e.start) return months.includes(getMonthIndex(e.start));
        return true;
      });
    }
    return evts;
  }, [allEvents, search, quarter]);

  const eventsByMonth = useMemo(() => {
    const map = {};
    for (let i = 0; i < 12; i++) map[i] = [];
    filteredEvents.forEach(e => {
      const mi = e.month ?? (e.start ? getMonthIndex(e.start) : 0);
      if (map[mi]) map[mi].push(e);
    });
    return map;
  }, [filteredEvents]);

  // Stats
  const stats = useMemo(() => {
    const miceCount = MICE_EVENTS.length;
    const sgCount = SG_EVENTS.length;
    const campCount = CAMPAIGNS.length;
    const outletCount = selectedVenue === "all" ? OUTLET_EVENTS.length : OUTLET_EVENTS.filter(e => e.venue === selectedVenue).length;
    const hhDays = Object.values(DAILY_HC).filter(d => d.rating === "hot-hot").length;
    const ccDays = Object.values(DAILY_HC).filter(d => d.rating === "cold-cold").length;
    // Busiest month by total events
    let busiest = 0, quietest = 0, bMax = 0, qMin = 999;
    for (let i = 0; i < 12; i++) {
      const count = (eventsByMonth[i] || []).length;
      if (count > bMax) { bMax = count; busiest = i; }
      if (count < qMin) { qMin = count; quietest = i; }
    }
    return { miceCount, sgCount, campCount, outletCount, hhDays, ccDays, busiest, quietest, custom: customEvents.length };
  }, [eventsByMonth, customEvents, selectedVenue]);

  const handleReset = async () => {
    if (!confirm("Reset all custom events and preferences?")) return;
    try { await window.storage.delete("calendar-events"); await window.storage.delete("calendar-settings"); } catch {}
    setCustomEvents([]);
    setLayers({ hotcold: true, mice: true, sg: true, visitor: true, school: true, campaign: true, outlet: true });
    setView("board");
    setQuarter("all");
    setSelectedVenue("all");
  };

  const addEvent = (evt) => {
    const newEvts = [...customEvents, { ...evt, id: `custom-${Date.now()}`, layer: evt.layer || "sg" }];
    saveEvents(newEvts);
    setShowAddForm(false);
  };

  const updateEvent = (evt) => {
    const newEvts = customEvents.map(e => e.id === evt.id ? evt : e);
    saveEvents(newEvts);
    setEditingEvent(null);
  };

  const deleteEvent = (id) => {
    if (!confirm("Delete this event?")) return;
    saveEvents(customEvents.filter(e => e.id !== id));
    setDetailItem(null);
  };

  const copySummary = () => {
    const qLabel = quarter === "all" ? "2026 Full Year" : quarter.toUpperCase();
    let text = `# 1-Group Marketing Calendar — ${qLabel}\n\n`;
    const months = quarter === "all" ? [...Array(12).keys()] : QUARTERS[quarter];
    months.forEach(mi => {
      const evts = eventsByMonth[mi] || [];
      if (evts.length === 0) return;
      text += `## ${MONTH_NAMES[mi]}\n`;
      evts.forEach(e => { text += `- ${e.name}${e.start ? ` (${e.start})` : ""}\n`; });
      text += "\n";
    });
    navigator.clipboard.writeText(text).catch(() => {});
    alert("Summary copied!");
  };

  if (!loaded) return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600"><div className="animate-pulse text-lg">Loading calendar...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 shadow-sm" style={{ background: "linear-gradient(135deg, #ffffff 0%, #fdf2f8 50%, #f5f3ff 100%)" }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ background: "linear-gradient(90deg, #f472b6, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1-Group Marketing Calendar 2026</h1>
              <p className="text-xs text-gray-600 mt-0.5">Demand · Events · Opportunities</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="bg-gray-100 border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-xs w-44 focus:outline-none focus:border-purple-500" />
              </div>
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-md"><Plus className="w-3.5 h-3.5" /> Add</button>
              <button onClick={copySummary} className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-xs px-3 py-1.5 rounded-md"><Copy className="w-3.5 h-3.5" /> Copy</button>
              <button onClick={handleReset} className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-xs px-3 py-1.5 rounded-md"><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
            </div>
          </div>

          {/* View & Quarter tabs */}
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <div className="flex gap-1">
              {[["board", "Board", Grid3X3], ["month", "Month", Calendar], ["heatmap", "Heatmap", BarChart3]].map(([v, label, Icon]) => (
                <button key={v} onClick={() => { setView(v); savePrefs(layers, v, quarter, selectedVenue); }} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md ${view === v ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 items-center">
              {["all", "q1", "q2", "q3", "q4"].map(q => (
                <button key={q} onClick={() => { setQuarter(q); savePrefs(layers, view, q, selectedVenue); }} className={`text-xs px-3 py-1.5 rounded-md ${quarter === q ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {q === "all" ? "All" : q.toUpperCase()}
                </button>
              ))}
              <div className="ml-2 flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Venue:</span>
                <select
                  value={selectedVenue}
                  onChange={e => { setSelectedVenue(e.target.value); savePrefs(layers, view, quarter, e.target.value); }}
                  className={`text-xs px-2 py-1.5 rounded-md border focus:outline-none ${selectedVenue === "all" ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-rose-100 border-rose-400 text-rose-700"}`}
                  style={{ minWidth: "140px" }}
                >
                  <option value="all">All Venues (Group)</option>
                  {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {[
              ["hotcold", "Hot/Cold", Flame, "#EF4444"],
              ["mice", "MICE", MapPin, "#8B5CF6"],
              ["sg", "SG Events", Star, "#F59E0B"],
              ["visitor", "Visitors", Users, "#10B981"],
              ["school", "Holidays", GraduationCap, "#14B8A6"],
              ["campaign", "Group Campaigns", Megaphone, "#EC4899"],
              ["outlet", "Outlet Activations", Zap, "#F43F5E"],
            ].map(([key, label, Icon, color]) => (
              <button key={key} onClick={() => toggleLayer(key)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${layers[key] ? "border-opacity-100" : "border-gray-300 opacity-40"}`}
                style={{ borderColor: layers[key] ? color : undefined, background: layers[key] ? color + "15" : undefined }}>
                {layers[key] ? <Eye className="w-3 h-3" style={{ color }} /> : <EyeOff className="w-3 h-3" />}
                <span style={{ color: layers[key] ? color : undefined }}>{label}</span>
              </button>
            ))}
            <button onClick={() => setShowStats(!showStats)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-300 hover:border-gray-400">
              <TrendingUp className="w-3 h-3" /> Stats
            </button>
            <button onClick={() => setShowVisitors(!showVisitors)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-300 hover:border-gray-400">
              <Users className="w-3 h-3" /> Visitor Map
            </button>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="mx-4 mt-3 p-3 bg-white border border-gray-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          {[
            ["MICE Events", stats.miceCount, "#8B5CF6"],
            ["SG Events", stats.sgCount, "#F59E0B"],
            ["Campaigns", stats.campCount, "#EC4899"],
            ["Hot-Hot Days", stats.hhDays, "#DC2626"],
            ["Cold-Cold Days", stats.ccDays, "#2563EB"],
            ["Custom Events", stats.custom, "#6366F1"],
            ["Busiest", MONTH_SHORT[stats.busiest], "#10B981"],
            ["Quietest", MONTH_SHORT[stats.quietest], "#60A5FA"],
          ].map(([label, val, color]) => (
            <div key={label}>
              <div className="text-lg font-bold" style={{ color }}>{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Visitor Heatmap Panel */}
      {showVisitors && (
        <div className="mx-4 mt-3 p-3 bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <h3 className="text-sm font-bold text-emerald-600 mb-2">International Visitor Intensity</h3>
          <table className="w-full text-xs">
            <thead><tr>
              <th className="text-left py-1 px-2 text-gray-500">Market</th>
              <th className="text-left py-1 px-1 text-gray-500">Arrivals</th>
              {MONTH_SHORT.map(m => <th key={m} className="py-1 px-1 text-gray-500 text-center">{m}</th>)}
            </tr></thead>
            <tbody>
              {VISITOR_DATA.map(v => (
                <tr key={v.market} className="border-t border-gray-200">
                  <td className="py-1 px-2 font-medium text-gray-700">{v.market}</td>
                  <td className="py-1 px-1 text-gray-500">{v.arrivals}</td>
                  {MONTH_SHORT.map(m => (
                    <td key={m} className="py-1 px-1 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: INTENSITY_COLORS[v.data[m]] || "#374151", color: v.data[m] === "Peak" ? "#fff" : v.data[m] === "High" ? "#fff" : "#065F46" }}>
                        {v.data[m]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {view === "board" && <BoardView eventsByMonth={eventsByMonth} layers={layers} quarter={quarter} onDetail={setDetailItem} onMonthClick={(mi) => { setSelectedMonth(mi); setView("month"); }} />}
        {view === "month" && <MonthView month={selectedMonth} setMonth={setSelectedMonth} events={eventsByMonth[selectedMonth] || []} layers={layers} onDetail={setDetailItem} />}
        {view === "heatmap" && <HeatmapView layers={layers} quarter={quarter} onDetail={setDetailItem} />}
      </div>

      {/* Detail Slide-over */}
      {detailItem && <DetailPanel item={detailItem} onClose={() => setDetailItem(null)} onEdit={(e) => { setDetailItem(null); setEditingEvent(e); }} onDelete={deleteEvent} />}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingEvent) && (
        <EventFormModal
          event={editingEvent}
          onSave={editingEvent ? updateEvent : addEvent}
          onClose={() => { setShowAddForm(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}

// ─── BOARD VIEW ───

function BoardView({ eventsByMonth, layers, quarter, onDetail, onMonthClick }) {
  const quarters = quarter === "all" ? ["q1", "q2", "q3", "q4"] : [quarter];
  return (
    <div className={`grid gap-4 ${quarters.length === 4 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"}`}>
      {quarters.map(q => (
        <div key={q} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 bg-white/90">
            <h2 className="font-bold text-sm text-purple-700">{q.toUpperCase()}</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {QUARTERS[q].map(mi => {
              const evts = eventsByMonth[mi] || [];
              const hc = DAILY_HC;
              // Month temp summary
              const days = daysInMonth(mi);
              let hhCount = 0, hCount = 0, cCount = 0, ccCount = 0;
              for (let d = 1; d <= days; d++) {
                const key = dateStr(mi, d);
                const r = hc[key]?.rating;
                if (r === "hot-hot") hhCount++;
                else if (r === "hot") hCount++;
                else if (r === "cold") cCount++;
                else ccCount++;
              }
              const peaks = getVisitorPeaks(mi);
              const hasPH = PUBLIC_HOLIDAYS.some(h => getMonthIndex(h.date) === mi);
              const isSchool = SCHOOL_HOLIDAYS.some(h => getMonthIndex(h.start) === mi || getMonthIndex(h.end) === mi);

              return (
                <div key={mi} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => onMonthClick(mi)} className="font-semibold text-sm text-gray-800 hover:text-purple-600 flex items-center gap-1">
                      {MONTH_NAMES[mi]}
                      <span className="text-xs text-gray-500 font-normal">({evts.length})</span>
                    </button>
                    <div className="flex gap-0.5">
                      {hasPH && layers.school && <Star className="w-3.5 h-3.5 text-amber-500 fill-yellow-400" />}
                      {isSchool && layers.school && <GraduationCap className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                  </div>

                  {/* Temperature bar */}
                  {layers.hotcold && (
                    <div className="flex h-2 rounded-full overflow-hidden mb-2 gap-px">
                      {hhCount > 0 && <div style={{ width: `${(hhCount / days) * 100}%`, background: "#DC2626" }} title={`${hhCount} Hot-Hot days`} />}
                      {hCount > 0 && <div style={{ width: `${(hCount / days) * 100}%`, background: "#EF4444" }} title={`${hCount} Hot days`} />}
                      {cCount > 0 && <div style={{ width: `${(cCount / days) * 100}%`, background: "#60A5FA" }} title={`${cCount} Cold days`} />}
                      {ccCount > 0 && <div style={{ width: `${(ccCount / days) * 100}%`, background: "#2563EB" }} title={`${ccCount} Cold-Cold days`} />}
                    </div>
                  )}

                  {/* Visitor peaks */}
                  {layers.visitor && peaks.length > 0 && (
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <Users className="w-3 h-3 text-emerald-600 shrink-0" />
                      {peaks.map(p => <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">{p}</span>)}
                    </div>
                  )}

                  {/* Event cards */}
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {evts.slice(0, 12).map(e => (
                      <EventChip key={e.id} event={e} onClick={() => onDetail(e)} />
                    ))}
                    {evts.length > 12 && <div className="text-xs text-gray-500 text-center">+{evts.length - 12} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EVENT CHIP ───

function EventChip({ event, onClick }) {
  const layer = event.layer || "sg";
  const color = LAYER_COLORS[layer] || LAYER_COLORS.sg;
  const isStarred = event.name?.includes("⭐");
  // Badge text: outlet chips show short venue abbreviation for quick scanning
  const venueAbbr = (v) => {
    if (!v) return "";
    if (v === "1-Altitude Coast") return "COAST";
    if (v === "Sol & Ora") return "SOL";
    if (v === "1-Altitude") return "1-ALT";
    if (v === "Alkaff Mansion") return "ALKAFF";
    if (v === "1-Flowerhill") return "FLOWER";
    if (v === "1-Arden") return "ARDEN";
    return v.slice(0, 6).toUpperCase();
  };
  const badgeText = layer === "mice" ? "MICE"
    : layer === "sg" ? (event.type?.split("/")[0]?.slice(0, 8) || "Event")
    : layer === "campaign" ? "1-GRP"
    : layer === "outlet" ? venueAbbr(event.venue)
    : layer;
  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:brightness-110 transition-all group" style={{ background: color.bg + "40", borderLeft: `3px solid ${color.primary}` }}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: isStarred ? "#FBBF24" : color.primary }} title={event.name + (event.venue ? ` · ${event.venue}` : "")}>{event.name}</div>
        {event.dateStr && <div className="text-xs text-gray-500">{event.dateStr}</div>}
        {event.start && !event.dateStr && <div className="text-xs text-gray-500">{event.start.slice(5)}{event.type === "Tactical Promotion" ? " · Tactical" : ""}</div>}
      </div>
      <div className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ background: color.primary, color: color.text }}>
        {badgeText}
      </div>
    </button>
  );
}

// ─── MONTH VIEW ───

function MonthView({ month, setMonth, events, layers, onDetail }) {
  const days = daysInMonth(month);
  const startDay = firstDayOfMonth(month); // 0=Sun
  const offset = startDay === 0 ? 6 : startDay - 1; // Mon=0

  const dayEvents = useMemo(() => {
    const map = {};
    for (let d = 1; d <= days; d++) map[d] = [];
    events.forEach(e => {
      // Try to extract day from dateStr or start
      if (e.dateStr) {
        const parts = e.dateStr.replace(/ *\(.*\)/, "").split("-");
        const startD = parseInt(parts[0]);
        const endD = parts.length > 1 ? parseInt(parts[1]) : startD;
        for (let d = startD; d <= Math.min(endD, days); d++) {
          if (map[d]) map[d].push(e);
        }
      } else if (e.start) {
        const sd = parseInt(e.start.split("-")[2]);
        const ed = e.end ? parseInt(e.end.split("-")[2]) : sd;
        for (let d = sd; d <= Math.min(ed, days); d++) {
          if (map[d]) map[d].push(e);
        }
      } else if (e.month !== undefined) {
        // Campaign — show on day 1
        if (map[1]) map[1].push(e);
      }
    });
    return map;
  }, [events, days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(Math.max(0, month - 1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ChevronLeft className="w-4 h-4" /></button>
        <h2 className="text-lg font-bold">{MONTH_NAMES[month]} 2026</h2>
        <button onClick={() => setMonth(Math.min(11, month + 1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} className="text-center text-xs text-gray-500 py-1 font-medium">{d}</div>
        ))}
        {/* Empty cells */}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {/* Day cells */}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const key = dateStr(month, d);
          const hc = DAILY_HC[key];
          const ph = isPublicHoliday(key);
          const sh = isSchoolHoliday(key);
          const evts = dayEvents[d] || [];
          const ratingColor = hc ? LAYER_COLORS[hc.rating]?.primary + "25" : "transparent";

          return (
            <div key={d} className="min-h-20 bg-white border border-gray-200 rounded-lg p-1 hover:border-gray-300 transition-colors cursor-pointer relative"
              style={{ background: layers.hotcold ? ratingColor : undefined, borderColor: sh && layers.school ? "#14B8A680" : undefined }}
              onClick={() => evts.length > 0 && onDetail(evts[0])}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-medium ${ph ? "text-amber-500" : "text-gray-600"}`}>{d}</span>
                <div className="flex gap-0.5">
                  {ph && layers.school && <Star className="w-2.5 h-2.5 text-amber-500 fill-yellow-400" />}
                  {layers.hotcold && hc && (hc.rating === "hot-hot" || hc.rating === "hot") && <Flame className="w-2.5 h-2.5" style={{ color: LAYER_COLORS[hc.rating].primary }} />}
                  {layers.hotcold && hc && (hc.rating === "cold-cold" || hc.rating === "cold") && <Snowflake className="w-2.5 h-2.5" style={{ color: LAYER_COLORS[hc.rating].primary }} />}
                </div>
              </div>
              {layers.hotcold && hc && hc.count > 0 && (
                <div className="text-xs mb-0.5" style={{ color: LAYER_COLORS[hc.rating].primary, fontSize: "10px" }}>{hc.count} bookings</div>
              )}
              <div className="space-y-0.5">
                {evts.slice(0, 2).map(e => {
                  const c = LAYER_COLORS[e.layer || "sg"];
                  return <div key={e.id} className="text-xs truncate px-1 rounded" style={{ background: c.primary + "30", color: c.primary, fontSize: "9px" }} title={e.name}>{e.name}</div>;
                })}
                {evts.length > 2 && <div className="text-xs text-gray-500" style={{ fontSize: "9px" }}>+{evts.length - 2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HEATMAP VIEW ───

function HeatmapView({ layers, quarter, onDetail }) {
  const months = quarter === "all" ? [...Array(12).keys()] : QUARTERS[quarter];
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${months.length}, 1fr)` }}>
          <div className="text-xs text-gray-500 font-medium py-1">Day</div>
          {months.map(mi => <div key={mi} className="text-xs text-gray-600 font-medium py-1 text-center">{MONTH_SHORT[mi]}</div>)}
          {Array.from({ length: 31 }).map((_, di) => {
            const d = di + 1;
            return (
              <React.Fragment key={d}>
                <div className="text-xs text-gray-500 py-0.5 text-right pr-2">{d}</div>
                {months.map(mi => {
                  if (d > daysInMonth(mi)) return <div key={mi} />;
                  const key = dateStr(mi, d);
                  const hc = DAILY_HC[key];
                  const ph = isPublicHoliday(key);
                  const sh = isSchoolHoliday(key);
                  const bg = hc ? LAYER_COLORS[hc.rating]?.primary || "#F3F4F6" : "#F3F4F6";
                  return (
                    <div key={mi} className="h-5 rounded-sm relative group cursor-pointer flex items-center justify-center"
                      style={{ background: layers.hotcold ? bg : "#F3F4F6", border: ph && layers.school ? "1px solid #EAB308" : sh && layers.school ? "1px solid #14B8A6" : "1px solid transparent" }}
                      title={`${MONTH_SHORT[mi]} ${d}: ${hc?.count || 0} bookings (${hc?.rating || "—"})${ph ? " 🌟 " + ph.name : ""}${sh ? " 🎓 School Holiday" : ""}`}>
                      {ph && layers.school && <Star className="w-2 h-2 text-amber-500 fill-yellow-400" />}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                        {MONTH_SHORT[mi]} {d}: {hc?.count || 0} bookings
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {[["Hot-Hot","#DC2626"],["Hot","#EF4444"],["Cold","#60A5FA"],["Cold-Cold","#2563EB"]].map(([l,c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm" style={{ background: c }} />
            <span className="text-xs text-gray-600">{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-yellow-400" />
          <span className="text-xs text-gray-600">Public Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm border border-teal-500" />
          <span className="text-xs text-gray-600">School Holiday</span>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ───

function DetailPanel({ item, onClose, onEdit, onDelete }) {
  const layer = item.layer || "sg";
  const color = LAYER_COLORS[layer] || LAYER_COLORS.sg;
  const isCustom = item.id?.startsWith("custom-");
  const mi = item.month ?? (item.start ? getMonthIndex(item.start) : 0);
  const peaks = getVisitorPeaks(mi);
  const hcInfo = item.start ? DAILY_HC[item.start] : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md bg-white border-l border-gray-200 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-sm" style={{ color: color.primary }}>
            {layer === "mice" ? "MICE Event"
              : layer === "campaign" ? "1-Group Campaign"
              : layer === "outlet" ? `Outlet ${item.type === "Tactical Promotion" ? "Tactical Promotion" : "Activation"}`
              : "Event Detail"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{item.name}</h2>
            {item.tagline && <p className="text-sm text-gray-600 italic mt-1">{item.tagline}</p>}
          </div>
          <div className="space-y-2 text-sm">
            {item.start && <div className="flex justify-between"><span className="text-gray-500">Dates</span><span>{item.start}{item.end && item.end !== item.start ? ` → ${item.end}` : ""}</span></div>}
            {item.dateStr && <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{MONTH_NAMES[mi]} {item.dateStr}</span></div>}
            {item.venue && <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="text-right font-medium text-rose-700">{item.venue}</span></div>}
            {item.type && <div className="flex justify-between"><span className="text-gray-500">Type</span><span>{item.type}</span></div>}
            {item.cat && <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-right">{item.cat}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Layer</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: color.primary, color: color.text }}>
                {layer === "mice" ? "MICE"
                  : layer === "sg" ? "SG Event"
                  : layer === "campaign" ? "Group Campaign"
                  : layer === "outlet" ? "Outlet"
                  : layer}
              </span>
            </div>
          </div>

          {/* Context: Hot/Cold for that date */}
          {hcInfo && (
            <div className="bg-gray-100 rounded-lg p-3">
              <h4 className="text-xs font-bold text-gray-600 mb-1">Demand on this date</h4>
              <div className="flex items-center gap-2">
                {(hcInfo.rating === "hot-hot" || hcInfo.rating === "hot") ? <Flame className="w-4 h-4" style={{ color: LAYER_COLORS[hcInfo.rating].primary }} /> : <Snowflake className="w-4 h-4" style={{ color: LAYER_COLORS[hcInfo.rating].primary }} />}
                <span className="text-sm font-medium" style={{ color: LAYER_COLORS[hcInfo.rating].primary }}>{hcInfo.rating.replace("-", " ").toUpperCase()}</span>
                <span className="text-xs text-gray-500">({hcInfo.count} bookings)</span>
              </div>
            </div>
          )}

          {/* Visitor peaks */}
          {peaks.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-3">
              <h4 className="text-xs font-bold text-gray-600 mb-1">Peak Visitor Markets in {MONTH_NAMES[mi]}</h4>
              <div className="flex flex-wrap gap-1">
                {peaks.map(p => <span key={p} className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{p}</span>)}
              </div>
            </div>
          )}

          {isCustom && (
            <div className="flex gap-2 pt-2">
              <button onClick={() => onEdit(item)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-md flex-1"><Edit className="w-3.5 h-3.5" /> Edit</button>
              <button onClick={() => onDelete(item.id)} className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-2 rounded-md flex-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EVENT FORM MODAL ───

function EventFormModal({ event, onSave, onClose }) {
  const [form, setForm] = useState(event || {
    name: "", layer: "sg", start: "2026-01-01", end: "2026-01-01", type: "", venue: "", cat: "", dateStr: "",
  });

  const handleSubmit = () => {
    if (!form.name) return;
    const mi = getMonthIndex(form.start);
    onSave({ ...form, month: mi });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white border border-gray-300 rounded-xl p-5 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-sm">{event ? "Edit Event" : "Add Event"}</h3>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Event name *" className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
        <select value={form.layer} onChange={e => setForm({ ...form, layer: e.target.value })} className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="sg">SG Event</option>
          <option value="mice">MICE</option>
          <option value="campaign">Group Campaign</option>
          <option value="outlet">Outlet Activation / Tactical</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Start</label>
            <input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">End</label>
            <input type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        {form.layer === "outlet" ? (
          <select value={form.venue || ""} onChange={e => setForm({ ...form, venue: e.target.value })} className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">— Select venue —</option>
            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : (
          <input value={form.venue || ""} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue" className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm" />
        )}
        {form.layer === "outlet" ? (
          <select value={form.type || ""} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">— Type —</option>
            <option value="Activation">Activation</option>
            <option value="Tactical Promotion">Tactical Promotion</option>
          </select>
        ) : (
          <input value={form.type || ""} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Type (Concert, Trade Show, etc.)" className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm" />
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-sm py-2 rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm py-2 rounded-md flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Save</button>
        </div>
      </div>
    </div>
  );
}

