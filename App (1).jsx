import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Calendar, Filter, Plus, Edit, Trash2, ChevronDown, ChevronUp, Star, Flame, Snowflake, X, Search, Copy, RotateCcw, Eye, EyeOff, BarChart3, Grid3X3, Layers, MapPin, Users, GraduationCap, Megaphone, ChevronLeft, ChevronRight, Check, AlertTriangle, Zap, TrendingUp, Ship } from "lucide-react";

// ─── EMBEDDED DATA ───

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QUARTERS = { q1:[0,1,2], q2:[3,4,5], q3:[6,7,8], q4:[9,10,11] };

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

const SG_EVENTS_RAW = [
  {m:"Jan",d:"02-03",n:"SINGLAND FESTIVAL - NE-YO & Intl Artists",v:"Marina Bay Sands",t:"Concert"},
  {m:"Jan",d:"02-03",n:"Super Junior Super Show 10",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Jan",d:"04",n:"Air Supply 50th Anniversary Tour",v:"MBS Grand Ballroom",t:"Concert"},
  {m:"Jan",d:"08-11",n:"Singapore Motorshow 2026",v:"Suntec Convention Centre",t:"Trade Show"},
  {m:"Jan",d:"13-14",n:"Mediterranean Food & Wine B2B",v:"Suntec",t:"Trade Show"},
  {m:"Jan",d:"17-18",n:"Tomorrow X Together (TXT) Concert",v:"Singapore Indoor Stadium",t:"Concert"},
  {m:"Jan",d:"23-25",n:"Art SG Contemporary Art Fair 2026",v:"Marina Bay Sands",t:"Art Exhibition"},
  {m:"Feb",d:"02-04",n:"Augmented World Expo",v:"Singapore Expo",t:"Technology Expo"},
  {m:"Feb",d:"03-08",n:"Singapore Airshow 2026",v:"Changi Exhibition Centre",t:"Trade Show"},
  {m:"Feb",d:"04-06",n:"Asia Photonics Expo (APE 2026)",v:"Marina Bay Sands",t:"Technology Expo"},
  {m:"Feb",d:"06-22",n:"Cirque Du Soleil - KOOZA",v:"Bayfront Event Space",t:"Entertainment"},
  {m:"Feb",d:"25-26",n:"Aviation Festival Asia",v:"Suntec",t:"Conference"},
  {m:"Mar",d:"10",n:"Disney Adventure - Maiden Voyage ⭐",v:"Marina Bay Cruise Centre",t:"Tourism Launch"},
  {m:"Mar",d:"12",n:"COMEX / IT SHOW",v:"Suntec Singapore",t:"Technology Expo"},
  {m:"Mar",d:"24-26",n:"BuildTech Asia 2026",v:"Singapore Expo",t:"Trade Show"},
  {m:"Mar",d:"25-27",n:"Asia Pacific Maritime (APM)",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Mar",d:"31",n:"GEO Connect Asia",v:"Marina Bay Sands",t:"Conference"},
  {m:"Apr",d:"03-12",n:"ARTBOX CAMP 2026",v:"Singapore EXPO",t:"Creative Festival"},
  {m:"Apr",d:"09-11",n:"GITEX ASIA x AI Everything 2026",v:"Marina Bay Sands",t:"Technology Expo"},
  {m:"Apr",d:"17-19",n:"IDEM Singapore - Dental Exhibition",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Apr",d:"20-24",n:"Beauty Asia 2026",v:"Marina Bay Sands",t:"Trade Show"},
  {m:"Apr",d:"21-24",n:"FHA-HoReCa",v:"Singapore Expo",t:"Trade Show"},
  {m:"Apr",d:"21-24",n:"Black Hat Asia",v:"Marina Bay Sands",t:"Security Conference"},
  {m:"Apr",d:"21-24",n:"ProWine Asia",v:"Singapore Expo",t:"Trade Show"},
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

// ─── LIGHT THEME COLOURS ───

const LAYER_COLORS = {
  "hot-hot": { primary: "#DC2626", bg: "#FEE2E2", text: "#fff" },
  "hot": { primary: "#EF4444", bg: "#FEE2E2", text: "#fff" },
  "cold": { primary: "#60A5FA", bg: "#DBEAFE", text: "#fff" },
  "cold-cold": { primary: "#2563EB", bg: "#DBEAFE", text: "#fff" },
  mice: { primary: "#8B5CF6", bg: "#EDE9FE", text: "#fff" },
  sg: { primary: "#D97706", bg: "#FEF3C7", text: "#000" },
  visitor: { primary: "#059669", bg: "#D1FAE5", text: "#fff" },
  school: { primary: "#0D9488", bg: "#CCFBF1", text: "#fff" },
  ph: { primary: "#CA8A04", bg: "#FEF9C3", text: "#000" },
  campaign: { primary: "#DB2777", bg: "#FCE7F3", text: "#fff" },
};

const INTENSITY_COLORS = { Peak: "#059669", High: "#10B981", Mod: "#6EE7B7", Low: "#D1FAE5" };

// ─── HELPERS ───

function isInRange(date, start, end) { return date >= start && date <= end; }
function isSchoolHoliday(dateStr) { return SCHOOL_HOLIDAYS.some(h => isInRange(dateStr, h.start, h.end)); }
function isPublicHoliday(dateStr) { return PUBLIC_HOLIDAYS.find(h => h.date === dateStr); }
function getMonthIndex(dateStr) { return parseInt(dateStr.split("-")[1]) - 1; }
function getQuarter(mi) { return mi < 3 ? "q1" : mi < 6 ? "q2" : mi < 9 ? "q3" : "q4"; }
function daysInMonth(mi) { return new Date(2026, mi + 1, 0).getDate(); }
function firstDayOfMonth(mi) { return new Date(2026, mi, 1).getDay(); }
function dateStr(mi, d) { return `2026-${String(mi + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
function getVisitorPeaks(mi) { const mk = MONTH_SHORT[mi]; return VISITOR_DATA.filter(v => v.data[mk] === "Peak").map(v => v.market); }

// ─── MAIN COMPONENT ───

export default function MarketingCalendar() {
  const [view, setView] = useState("board");
  const [quarter, setQuarter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [search, setSearch] = useState("");
  const [layers, setLayers] = useState({ hotcold: true, mice: true, sg: true, visitor: true, school: true, campaign: true });
  const [detailItem, setDetailItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customEvents, setCustomEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("calendar-events");
      if (saved) setCustomEvents(JSON.parse(saved));
      const prefs = localStorage.getItem("calendar-settings");
      if (prefs) {
        const p = JSON.parse(prefs);
        if (p.layers) setLayers(p.layers);
        if (p.view) setView(p.view);
        if (p.quarter) setQuarter(p.quarter);
      }
    } catch (e) {}
    setLoaded(true);
  }, []);

  const saveEvents = useCallback((evts) => {
    setCustomEvents(evts);
    try { localStorage.setItem("calendar-events", JSON.stringify(evts)); } catch {}
  }, []);

  const savePrefs = useCallback((l, v, q) => {
    try { localStorage.setItem("calendar-settings", JSON.stringify({ layers: l, view: v, quarter: q })); } catch {}
  }, []);

  const toggleLayer = (key) => {
    const next = { ...layers, [key]: !layers[key] };
    setLayers(next);
    savePrefs(next, view, quarter);
  };

  const allEvents = useMemo(() => {
    const events = [];
    if (layers.mice) events.push(...MICE_EVENTS);
    if (layers.sg) events.push(...SG_EVENTS);
    if (layers.campaign) events.push(...CAMPAIGNS.map(c => ({
      ...c, start: `2026-${String(c.month + 1).padStart(2, "0")}-01`,
      end: `2026-${String(c.month + 1).padStart(2, "0")}-28`,
    })));
    events.push(...customEvents);
    return events;
  }, [layers, customEvents]);

  const filteredEvents = useMemo(() => {
    let evts = allEvents;
    if (search) {
      const s = search.toLowerCase();
      evts = evts.filter(e => e.name?.toLowerCase().includes(s) || e.cat?.toLowerCase().includes(s) || e.type?.toLowerCase().includes(s));
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

  const stats = useMemo(() => {
    const miceCount = MICE_EVENTS.length;
    const sgCount = SG_EVENTS.length;
    const campCount = CAMPAIGNS.length;
    const hhDays = Object.values(DAILY_HC).filter(d => d.rating === "hot-hot").length;
    const ccDays = Object.values(DAILY_HC).filter(d => d.rating === "cold-cold").length;
    let busiest = 0, quietest = 0, bMax = 0, qMin = 999;
    for (let i = 0; i < 12; i++) {
      const count = (eventsByMonth[i] || []).length;
      if (count > bMax) { bMax = count; busiest = i; }
      if (count < qMin) { qMin = count; quietest = i; }
    }
    return { miceCount, sgCount, campCount, hhDays, ccDays, busiest, quietest, custom: customEvents.length };
  }, [eventsByMonth, customEvents]);

  const handleReset = () => {
    if (!confirm("Reset all custom events and preferences?")) return;
    try { localStorage.removeItem("calendar-events"); localStorage.removeItem("calendar-settings"); } catch {}
    setCustomEvents([]);
    setLayers({ hotcold: true, mice: true, sg: true, visitor: true, school: true, campaign: true });
    setView("board");
    setQuarter("all");
  };

  const addEvent = (evt) => {
    const newEvts = [...customEvents, { ...evt, id: `custom-${Date.now()}`, layer: evt.layer || "sg" }];
    saveEvents(newEvts);
    setShowAddForm(false);
  };

  const updateEvent = (evt) => {
    saveEvents(customEvents.map(e => e.id === evt.id ? evt : e));
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

  if (!loaded) return <div className="flex items-center justify-center h-screen" style={{background:"#F8FAFC"}}><div className="animate-pulse text-lg" style={{color:"#6366F1"}}>Loading calendar...</div></div>;

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF", color: "#0F172A", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 50%, #F5F3FF 100%)", borderBottom: "1px solid #E2E8F0" }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ background: "linear-gradient(90deg, #DB2777, #7C3AED, #2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1-Group Marketing Calendar 2026</h1>
              <p className="text-xs mt-0.5" style={{color:"#94A3B8"}}>Demand · Events · Opportunities</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:"#94A3B8"}} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="rounded-md pl-7 pr-3 py-1.5 text-xs w-44 focus:outline-none" style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#0F172A" }} />
              </div>
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 text-white text-xs px-3 py-1.5 rounded-md" style={{background:"#7C3AED"}}><Plus className="w-3.5 h-3.5" /> Add</button>
              <button onClick={copySummary} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md" style={{background:"#F1F5F9",color:"#475569",border:"1px solid #E2E8F0"}}><Copy className="w-3.5 h-3.5" /> Copy</button>
              <button onClick={handleReset} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md" style={{background:"#F1F5F9",color:"#475569",border:"1px solid #E2E8F0"}}><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <div className="flex gap-1">
              {[["board", "Board", Grid3X3], ["month", "Month", Calendar], ["heatmap", "Heatmap", BarChart3]].map(([v, label, Icon]) => (
                <button key={v} onClick={() => { setView(v); savePrefs(layers, v, quarter); }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors"
                  style={{ background: view === v ? "#7C3AED" : "#F1F5F9", color: view === v ? "#fff" : "#475569", border: view === v ? "none" : "1px solid #E2E8F0" }}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {["all", "q1", "q2", "q3", "q4"].map(q => (
                <button key={q} onClick={() => { setQuarter(q); savePrefs(layers, view, q); }}
                  className="text-xs px-3 py-1.5 rounded-md transition-colors"
                  style={{ background: quarter === q ? "#4F46E5" : "#F1F5F9", color: quarter === q ? "#fff" : "#475569", border: quarter === q ? "none" : "1px solid #E2E8F0" }}>
                  {q === "all" ? "All" : q.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {[
              ["hotcold", "Hot/Cold", Flame, "#EF4444"],
              ["mice", "MICE", MapPin, "#8B5CF6"],
              ["sg", "SG Events", Star, "#D97706"],
              ["visitor", "Visitors", Users, "#059669"],
              ["school", "Holidays", GraduationCap, "#0D9488"],
              ["campaign", "Campaigns", Megaphone, "#DB2777"],
            ].map(([key, label, Icon, color]) => (
              <button key={key} onClick={() => toggleLayer(key)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  border: `1.5px solid ${layers[key] ? color : "#E2E8F0"}`,
                  background: layers[key] ? color + "10" : "#F8FAFC",
                  opacity: layers[key] ? 1 : 0.5,
                }}>
                {layers[key] ? <Eye className="w-3 h-3" style={{ color }} /> : <EyeOff className="w-3 h-3" style={{color:"#94A3B8"}} />}
                <span style={{ color: layers[key] ? color : "#94A3B8" }}>{label}</span>
              </button>
            ))}
            <button onClick={() => setShowStats(!showStats)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{border:"1.5px solid #E2E8F0",color:"#475569"}}>
              <TrendingUp className="w-3 h-3" /> Stats
            </button>
            <button onClick={() => setShowVisitors(!showVisitors)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{border:"1.5px solid #E2E8F0",color:"#475569"}}>
              <Users className="w-3 h-3" /> Visitor Map
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex items-center gap-4 flex-wrap text-xs" style={{background:"#F8FAFC",borderBottom:"1px solid #E2E8F0"}}>
        <span style={{color:"#94A3B8",fontWeight:600}}>Legend:</span>
        {[["Hot-Hot","#DC2626","#FEE2E2"],["Hot","#EF4444","#FEE2E2"],["Cold","#60A5FA","#DBEAFE"],["Cold-Cold","#2563EB","#DBEAFE"]].map(([l,c,bg]) => (
          <span key={l} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:c}} /><span style={{color:"#475569"}}>{l}</span></span>
        ))}
        <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{color:"#CA8A04",fill:"#CA8A04"}} /><span style={{color:"#475569"}}>Public Holiday</span></span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{border:"2px solid #0D9488"}} /><span style={{color:"#475569"}}>School Holiday</span></span>
      </div>

      {showStats && (
        <div className="mx-4 mt-3 p-3 rounded-lg grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
          {[
            ["MICE Events", stats.miceCount, "#8B5CF6"],["SG Events", stats.sgCount, "#D97706"],
            ["Campaigns", stats.campCount, "#DB2777"],["Hot-Hot Days", stats.hhDays, "#DC2626"],
            ["Cold-Cold Days", stats.ccDays, "#2563EB"],["Custom Events", stats.custom, "#6366F1"],
            ["Busiest", MONTH_SHORT[stats.busiest], "#059669"],["Quietest", MONTH_SHORT[stats.quietest], "#60A5FA"],
          ].map(([label, val, color]) => (
            <div key={label}><div className="text-lg font-bold" style={{ color }}>{val}</div><div className="text-xs" style={{color:"#94A3B8"}}>{label}</div></div>
          ))}
        </div>
      )}

      {showVisitors && (
        <div className="mx-4 mt-3 p-3 rounded-lg overflow-x-auto" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
          <h3 className="text-sm font-bold mb-2" style={{color:"#059669"}}>International Visitor Intensity</h3>
          <table className="w-full text-xs">
            <thead><tr>
              <th className="text-left py-1 px-2" style={{color:"#94A3B8"}}>Market</th>
              <th className="text-left py-1 px-1" style={{color:"#94A3B8"}}>Arrivals</th>
              {MONTH_SHORT.map(m => <th key={m} className="py-1 px-1 text-center" style={{color:"#94A3B8"}}>{m}</th>)}
            </tr></thead>
            <tbody>
              {VISITOR_DATA.map(v => (
                <tr key={v.market} style={{borderTop:"1px solid #E2E8F0"}}>
                  <td className="py-1 px-2 font-medium" style={{color:"#0F172A"}}>{v.market}</td>
                  <td className="py-1 px-1" style={{color:"#94A3B8"}}>{v.arrivals}</td>
                  {MONTH_SHORT.map(m => (
                    <td key={m} className="py-1 px-1 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium" style={{
                        background: INTENSITY_COLORS[v.data[m]] || "#F1F5F9",
                        color: v.data[m] === "Peak" || v.data[m] === "High" ? "#fff" : "#065F46"
                      }}>{v.data[m]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4">
        {view === "board" && <BoardView eventsByMonth={eventsByMonth} layers={layers} quarter={quarter} onDetail={setDetailItem} onMonthClick={(mi) => { setSelectedMonth(mi); setView("month"); }} />}
        {view === "month" && <MonthView month={selectedMonth} setMonth={setSelectedMonth} events={eventsByMonth[selectedMonth] || []} layers={layers} onDetail={setDetailItem} />}
        {view === "heatmap" && <HeatmapView layers={layers} quarter={quarter} />}
      </div>

      {detailItem && <DetailPanel item={detailItem} onClose={() => setDetailItem(null)} onEdit={(e) => { setDetailItem(null); setEditingEvent(e); }} onDelete={deleteEvent} />}
      {(showAddForm || editingEvent) && <EventFormModal event={editingEvent} onSave={editingEvent ? updateEvent : addEvent} onClose={() => { setShowAddForm(false); setEditingEvent(null); }} />}
    </div>
  );
}

// ─── BOARD VIEW ───

function BoardView({ eventsByMonth, layers, quarter, onDetail, onMonthClick }) {
  const quarters = quarter === "all" ? ["q1", "q2", "q3", "q4"] : [quarter];
  return (
    <div className={`grid gap-4 ${quarters.length === 4 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"}`}>
      {quarters.map(q => (
        <div key={q} className="rounded-xl overflow-hidden" style={{background:"#F8FAFC",border:"1px solid #E2E8F0",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
          <div className="px-4 py-2" style={{borderBottom:"1px solid #E2E8F0",background:"#fff"}}>
            <h2 className="font-bold text-sm" style={{color:"#7C3AED"}}>{q.toUpperCase()}</h2>
          </div>
          {QUARTERS[q].map(mi => {
            const evts = eventsByMonth[mi] || [];
            const days = daysInMonth(mi);
            let hhCount = 0, hCount = 0, cCount = 0, ccCount = 0;
            for (let d = 1; d <= days; d++) {
              const key = dateStr(mi, d);
              const r = DAILY_HC[key]?.rating;
              if (r === "hot-hot") hhCount++; else if (r === "hot") hCount++; else if (r === "cold") cCount++; else ccCount++;
            }
            const peaks = getVisitorPeaks(mi);
            const hasPH = PUBLIC_HOLIDAYS.some(h => getMonthIndex(h.date) === mi);
            const isSchool = SCHOOL_HOLIDAYS.some(h => getMonthIndex(h.start) === mi || getMonthIndex(h.end) === mi);

            return (
              <div key={mi} className="p-3" style={{borderBottom:"1px solid #F1F5F9"}}>
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => onMonthClick(mi)} className="font-semibold text-sm flex items-center gap-1" style={{color:"#0F172A"}}>
                    {MONTH_NAMES[mi]} <span className="text-xs font-normal" style={{color:"#94A3B8"}}>({evts.length})</span>
                  </button>
                  <div className="flex gap-0.5">
                    {hasPH && layers.school && <Star className="w-3.5 h-3.5" style={{color:"#CA8A04",fill:"#CA8A04"}} />}
                    {isSchool && layers.school && <GraduationCap className="w-3.5 h-3.5" style={{color:"#0D9488"}} />}
                  </div>
                </div>
                {layers.hotcold && (
                  <div className="flex h-2 rounded-full overflow-hidden mb-2 gap-px" style={{background:"#E2E8F0"}}>
                    {hhCount > 0 && <div style={{ width: `${(hhCount / days) * 100}%`, background: "#DC2626" }} />}
                    {hCount > 0 && <div style={{ width: `${(hCount / days) * 100}%`, background: "#EF4444" }} />}
                    {cCount > 0 && <div style={{ width: `${(cCount / days) * 100}%`, background: "#60A5FA" }} />}
                    {ccCount > 0 && <div style={{ width: `${(ccCount / days) * 100}%`, background: "#2563EB" }} />}
                  </div>
                )}
                {layers.visitor && peaks.length > 0 && (
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <Users className="w-3 h-3 shrink-0" style={{color:"#059669"}} />
                    {peaks.map(p => <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{background:"#D1FAE5",color:"#065F46"}}>{p}</span>)}
                  </div>
                )}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {evts.slice(0, 12).map(e => <EventChip key={e.id} event={e} onClick={() => onDetail(e)} />)}
                  {evts.length > 12 && <div className="text-xs text-center" style={{color:"#94A3B8"}}>+{evts.length - 12} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function EventChip({ event, onClick }) {
  const layer = event.layer || "sg";
  const color = LAYER_COLORS[layer] || LAYER_COLORS.sg;
  const isStarred = event.name?.includes("⭐");
  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group"
      style={{ background: "#fff", borderLeft: `3px solid ${color.primary}`, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: `1px solid #E2E8F0`, borderLeftWidth: "3px", borderLeftColor: color.primary }}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: isStarred ? "#B45309" : color.primary }} title={event.name}>{event.name}</div>
        {event.dateStr && <div className="text-xs" style={{color:"#94A3B8"}}>{event.dateStr}</div>}
        {event.start && !event.dateStr && <div className="text-xs" style={{color:"#94A3B8"}}>{event.start.slice(5)}</div>}
      </div>
      <div className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ background: color.primary, color: color.text }}>
        {layer === "mice" ? "MICE" : layer === "sg" ? event.type?.split("/")[0]?.slice(0, 8) || "Event" : layer === "campaign" ? "1-GRP" : layer}
      </div>
    </button>
  );
}

// ─── MONTH VIEW ───

function MonthView({ month, setMonth, events, layers, onDetail }) {
  const days = daysInMonth(month);
  const startDay = firstDayOfMonth(month);
  const offset = startDay === 0 ? 6 : startDay - 1;

  const dayEvents = useMemo(() => {
    const map = {};
    for (let d = 1; d <= days; d++) map[d] = [];
    events.forEach(e => {
      if (e.dateStr) {
        const parts = e.dateStr.replace(/ *\(.*\)/, "").split("-");
        const startD = parseInt(parts[0]);
        const endD = parts.length > 1 ? parseInt(parts[1]) : startD;
        for (let d = startD; d <= Math.min(endD, days); d++) { if (map[d]) map[d].push(e); }
      } else if (e.start) {
        const sd = parseInt(e.start.split("-")[2]);
        const ed = e.end ? parseInt(e.end.split("-")[2]) : sd;
        for (let d = sd; d <= Math.min(ed, days); d++) { if (map[d]) map[d].push(e); }
      } else if (e.month !== undefined) {
        if (map[1]) map[1].push(e);
      }
    });
    return map;
  }, [events, days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(Math.max(0, month - 1))} className="p-2 rounded-lg" style={{background:"#F1F5F9",border:"1px solid #E2E8F0"}}><ChevronLeft className="w-4 h-4" style={{color:"#475569"}} /></button>
        <h2 className="text-lg font-bold" style={{color:"#0F172A"}}>{MONTH_NAMES[month]} 2026</h2>
        <button onClick={() => setMonth(Math.min(11, month + 1))} className="p-2 rounded-lg" style={{background:"#F1F5F9",border:"1px solid #E2E8F0"}}><ChevronRight className="w-4 h-4" style={{color:"#475569"}} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} className="text-center text-xs py-1 font-medium" style={{color:"#94A3B8"}}>{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const key = dateStr(month, d);
          const hc = DAILY_HC[key];
          const ph = isPublicHoliday(key);
          const sh = isSchoolHoliday(key);
          const evts = dayEvents[d] || [];
          const ratingBg = hc && layers.hotcold ? LAYER_COLORS[hc.rating]?.primary + "18" : "#fff";

          return (
            <div key={d} className="min-h-20 rounded-lg p-1 cursor-pointer relative transition-colors"
              style={{ background: ratingBg, border: sh && layers.school ? "1.5px solid #0D9488" : "1px solid #E2E8F0" }}
              onClick={() => evts.length > 0 && onDetail(evts[0])}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium" style={{color: ph ? "#B45309" : "#475569"}}>{d}</span>
                <div className="flex gap-0.5">
                  {ph && layers.school && <Star className="w-2.5 h-2.5" style={{color:"#CA8A04",fill:"#CA8A04"}} />}
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
                  return <div key={e.id} className="text-xs truncate px-1 rounded" style={{ background: c.primary + "20", color: c.primary, fontSize: "9px" }} title={e.name}>{e.name}</div>;
                })}
                {evts.length > 2 && <div className="text-xs" style={{color:"#94A3B8",fontSize:"9px"}}>+{evts.length - 2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HEATMAP VIEW ───

function HeatmapView({ layers, quarter }) {
  const months = quarter === "all" ? [...Array(12).keys()] : QUARTERS[quarter];
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${months.length}, 1fr)` }}>
          <div className="text-xs font-medium py-1" style={{color:"#94A3B8"}}>Day</div>
          {months.map(mi => <div key={mi} className="text-xs font-medium py-1 text-center" style={{color:"#475569"}}>{MONTH_SHORT[mi]}</div>)}
          {Array.from({ length: 31 }).map((_, di) => {
            const d = di + 1;
            return (
              <React.Fragment key={d}>
                <div className="text-xs py-0.5 text-right pr-2" style={{color:"#94A3B8"}}>{d}</div>
                {months.map(mi => {
                  if (d > daysInMonth(mi)) return <div key={mi} />;
                  const key = dateStr(mi, d);
                  const hc = DAILY_HC[key];
                  const ph = isPublicHoliday(key);
                  const sh = isSchoolHoliday(key);
                  const bg = hc && layers.hotcold ? LAYER_COLORS[hc.rating]?.primary || "#F1F5F9" : "#F1F5F9";
                  return (
                    <div key={mi} className="h-5 rounded-sm relative group cursor-pointer flex items-center justify-center"
                      style={{ background: bg, border: ph && layers.school ? "1.5px solid #CA8A04" : sh && layers.school ? "1.5px solid #0D9488" : "1px solid #E2E8F0" }}
                      title={`${MONTH_SHORT[mi]} ${d}: ${hc?.count || 0} bookings (${hc?.rating || "—"})${ph ? " ★ " + ph.name : ""}${sh ? " 🎓 School Holiday" : ""}`}>
                      {ph && layers.school && <Star className="w-2 h-2" style={{color:"#CA8A04",fill:"#CA8A04"}} />}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity"
                        style={{background:"#0F172A",color:"#fff"}}>
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
      <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.3)"}} />
      <div className="relative w-full max-w-md overflow-y-auto" style={{background:"#fff",borderLeft:"1px solid #E2E8F0",boxShadow:"-4px 0 24px rgba(0,0,0,0.1)"}} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 p-4 flex items-center justify-between z-10" style={{background:"#fff",borderBottom:"1px solid #E2E8F0"}}>
          <h3 className="font-bold text-sm" style={{ color: color.primary }}>{layer === "mice" ? "MICE Event" : layer === "campaign" ? "1-Group Campaign" : "Event Detail"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg" style={{background:"#F1F5F9"}}><X className="w-4 h-4" style={{color:"#475569"}} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-bold" style={{color:"#0F172A"}}>{item.name}</h2>
            {item.tagline && <p className="text-sm italic mt-1" style={{color:"#94A3B8"}}>{item.tagline}</p>}
          </div>
          <div className="space-y-2 text-sm">
            {item.start && <div className="flex justify-between"><span style={{color:"#94A3B8"}}>Dates</span><span>{item.start}{item.end && item.end !== item.start ? ` → ${item.end}` : ""}</span></div>}
            {item.dateStr && <div className="flex justify-between"><span style={{color:"#94A3B8"}}>Date</span><span>{MONTH_NAMES[mi]} {item.dateStr}</span></div>}
            {item.venue && <div className="flex justify-between"><span style={{color:"#94A3B8"}}>Venue</span><span className="text-right">{item.venue}</span></div>}
            {item.type && <div className="flex justify-between"><span style={{color:"#94A3B8"}}>Type</span><span>{item.type}</span></div>}
            {item.cat && <div className="flex justify-between"><span style={{color:"#94A3B8"}}>Category</span><span className="text-right">{item.cat}</span></div>}
            <div className="flex justify-between"><span style={{color:"#94A3B8"}}>Layer</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: color.primary, color: color.text }}>
                {layer === "mice" ? "MICE" : layer === "sg" ? "SG Event" : layer === "campaign" ? "Campaign" : layer}
              </span>
            </div>
          </div>
          {hcInfo && (
            <div className="rounded-lg p-3" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
              <h4 className="text-xs font-bold mb-1" style={{color:"#94A3B8"}}>Demand on this date</h4>
              <div className="flex items-center gap-2">
                {(hcInfo.rating === "hot-hot" || hcInfo.rating === "hot") ? <Flame className="w-4 h-4" style={{ color: LAYER_COLORS[hcInfo.rating].primary }} /> : <Snowflake className="w-4 h-4" style={{ color: LAYER_COLORS[hcInfo.rating].primary }} />}
                <span className="text-sm font-medium" style={{ color: LAYER_COLORS[hcInfo.rating].primary }}>{hcInfo.rating.replace("-", " ").toUpperCase()}</span>
                <span className="text-xs" style={{color:"#94A3B8"}}>({hcInfo.count} bookings)</span>
              </div>
            </div>
          )}
          {peaks.length > 0 && (
            <div className="rounded-lg p-3" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
              <h4 className="text-xs font-bold mb-1" style={{color:"#94A3B8"}}>Peak Visitor Markets in {MONTH_NAMES[mi]}</h4>
              <div className="flex flex-wrap gap-1">
                {peaks.map(p => <span key={p} className="text-xs px-2 py-0.5 rounded" style={{background:"#D1FAE5",color:"#065F46"}}>{p}</span>)}
              </div>
            </div>
          )}
          {isCustom && (
            <div className="flex gap-2 pt-2">
              <button onClick={() => onEdit(item)} className="flex items-center gap-1 text-white text-xs px-3 py-2 rounded-md flex-1" style={{background:"#4F46E5"}}><Edit className="w-3.5 h-3.5" /> Edit</button>
              <button onClick={() => onDelete(item.id)} className="flex items-center gap-1 text-white text-xs px-3 py-2 rounded-md flex-1" style={{background:"#DC2626"}}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EVENT FORM MODAL ───

function EventFormModal({ event, onSave, onClose }) {
  const [form, setForm] = useState(event || { name: "", layer: "sg", start: "2026-01-01", end: "2026-01-01", type: "", venue: "", cat: "", dateStr: "" });

  const handleSubmit = () => {
    if (!form.name) return;
    const mi = getMonthIndex(form.start);
    onSave({ ...form, month: mi });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.4)"}} />
      <div className="relative rounded-xl p-5 w-full max-w-md space-y-3" style={{background:"#fff",border:"1px solid #E2E8F0",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-sm" style={{color:"#0F172A"}}>{event ? "Edit Event" : "Add Event"}</h3>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Event name *" className="w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={{background:"#F8FAFC",border:"1px solid #E2E8F0",color:"#0F172A"}} />
        <select value={form.layer} onChange={e => setForm({ ...form, layer: e.target.value })} className="w-full rounded-md px-3 py-2 text-sm" style={{background:"#F8FAFC",border:"1px solid #E2E8F0",color:"#0F172A"}}>
          <option value="sg">SG Event</option><option value="mice">MICE</option><option value="campaign">Campaign</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs" style={{color:"#94A3B8"}}>Start</label><input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className="w-full rounded-md px-3 py-2 text-sm" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}} /></div>
          <div><label className="text-xs" style={{color:"#94A3B8"}}>End</label><input type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className="w-full rounded-md px-3 py-2 text-sm" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}} /></div>
        </div>
        <input value={form.venue || ""} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue" className="w-full rounded-md px-3 py-2 text-sm" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}} />
        <input value={form.type || ""} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Type (Concert, Trade Show, etc.)" className="w-full rounded-md px-3 py-2 text-sm" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}} />
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 text-sm py-2 rounded-md" style={{background:"#F1F5F9",color:"#475569",border:"1px solid #E2E8F0"}}>Cancel</button>
          <button onClick={handleSubmit} className="flex-1 text-white text-sm py-2 rounded-md flex items-center justify-center gap-1" style={{background:"#7C3AED"}}><Check className="w-3.5 h-3.5" /> Save</button>
        </div>
      </div>
    </div>
  );
}
