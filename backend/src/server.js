// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const { Pool } = require("pg");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 5000);
const REACH_PER_RUPEE = Number(process.env.REACH_PER_RUPEE || 18);
const PLATFORM_FEE_RATE = Number(process.env.PLATFORM_FEE_RATE || 0.05);
const TRANSACTION_FEE_RATE = Number(process.env.TRANSACTION_FEE_RATE || 0.02);
const useDb = process.env.USE_DATABASE === "true" && !!process.env.DATABASE_URL;
const pool = useDb ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const demoUser = { id: "demo-user", name: "Praveen Kumar", email: "praveen.demo@example.com", avatarInitials: "PK" };
const seed = [
  {
    id: "camp-clean-rivers", title: "Cleaner rivers start with local action", category: "Environment",
    creatorName: "River Commons Collective", summary: "A practical community campaign sharing river cleanup data and ways residents can help reduce plastic waste.",
    coverImage: "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1200&q=80",
    storyIntro: "Healthy rivers begin with visible information and small actions that communities can take together.",
    storySections: [
      { heading: "Why this matters", body: "Plastic waste can travel far beyond the place where it enters a waterway. Local monitoring and clear public information help communities understand where action is most useful." },
      { heading: "What this campaign will do", body: "This message campaign will promote a public explainer, share practical waste-reduction steps, and direct interested residents to local cleanup resources." }
    ],
    sources: [{ title: "UNEP — Plastic pollution", url: "https://www.unep.org/plastic-pollution" }, { title: "Our World in Data — Plastic pollution", url: "https://ourworldindata.org/plastic-pollution" }],
    adHeadline: "Small actions. Cleaner rivers.", adDescription: "Explore practical steps for reducing river plastic waste.", cta: "Learn more",
    audienceLocation: "Hyderabad, Telangana", audienceInterests: ["Environment", "Community action"], channels: ["Social feeds", "Display"],
    durationDays: 21, fundingGoal: 50000, raised: 32750, status: "available_for_funding", createdAt: now(),
    estimatedReach: 900000, adBudget: 45000, adSpend: 0, impressions: 0, clicks: 0, measuredReach: null, backers: 0, deadline: new Date(Date.now()+14*86400000).toISOString()
  },
  {
    id: "camp-rural-science", title: "Make science learning accessible everywhere", category: "Education",
    creatorName: "Open Learning Lab", summary: "Help a free science learning guide reach students and educators beyond existing school networks.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    storyIntro: "Curiosity is everywhere, but useful learning resources do not always reach every learner.",
    storySections: [
      { heading: "The opportunity", body: "Short, accessible science explainers can give students and educators a starting point for experiments, questions, and further learning." },
      { heading: "The message", body: "This campaign promotes a free guide and classroom-friendly activities. Contributions support distribution of the message and do not pay a school or individual directly." }
    ],
    sources: [{ title: "UNESCO — Education", url: "https://www.unesco.org/en/education" }],
    adHeadline: "Science belongs to everyone", adDescription: "Discover a free guide for curious learners.", cta: "Explore guide",
    audienceLocation: "India", audienceInterests: ["Education", "Science", "Teachers"], channels: ["Social feeds"],
    durationDays: 30, fundingGoal: 35000, raised: 16800, status: "available_for_funding", createdAt: now(),
    estimatedReach: 630000, adBudget: 31500, adSpend: 0, impressions: 0, clicks: 0, measuredReach: null, backers: 0, deadline: new Date(Date.now()+20*86400000).toISOString()
  },
  {
    id: "camp-public-health", title: "Clear health information saves time", category: "Health",
    creatorName: "Community Health Notes", summary: "Promote a plain-language guide that helps people prepare better questions for healthcare appointments.",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    storyIntro: "Good information can help people have more confident conversations with qualified health professionals.",
    storySections: [
      { heading: "A clearer starting point", body: "This campaign shares a general appointment-preparation checklist: note symptoms, list current medicines, and write down questions to ask a qualified clinician." },
      { heading: "Stay informed", body: "The guide is educational and does not replace professional diagnosis or treatment. The campaign funds message distribution only." }
    ],
    sources: [{ title: "WHO — Health topics", url: "https://www.who.int/health-topics" }],
    adHeadline: "Prepare for your next health visit", adDescription: "A simple checklist for clearer conversations.", cta: "Read guide",
    audienceLocation: "India", audienceInterests: ["Health education", "Families"], channels: ["Social feeds", "Display"],
    durationDays: 14, fundingGoal: 25000, raised: 9200, status: "available_for_funding", createdAt: now(),
    estimatedReach: 450000, adBudget: 22500, adSpend: 0, impressions: 0, clicks: 0, measuredReach: null, backers: 0, deadline: new Date(Date.now()+9*86400000).toISOString()
  },
  {
    id: "camp-local-arts", title: "Local artists deserve a wider audience", category: "Arts & Culture",
    creatorName: "Neighbourhood Arts Network", summary: "Introduce emerging local artists and their work to people who may not discover them through existing social circles.",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
    storyIntro: "Creative communities thrive when people can discover new work and learn the stories behind it.",
    storySections: [{ heading: "Discover nearby creativity", body: "This campaign promotes a digital showcase of emerging artists and gives audiences a way to explore their work and public events." }],
    sources: [{ title: "UNESCO — Culture", url: "https://www.unesco.org/en/culture" }],
    adHeadline: "Meet the artists around you", adDescription: "Explore new work from local creative communities.", cta: "View showcase",
    audienceLocation: "Telangana", audienceInterests: ["Arts", "Culture", "Local events"], channels: ["Social feeds"],
    durationDays: 28, fundingGoal: 40000, raised: 21400, status: "available_for_funding", createdAt: now(),
    estimatedReach: 720000, adBudget: 36000, adSpend: 0, impressions: 0, clicks: 0, measuredReach: null, backers: 0, deadline: new Date(Date.now()+17*86400000).toISOString()
  }
];
let memoryCampaigns = seed.map(c => ({ ...c }));
let memoryContributions = [];
let memoryActivity = [
  { id: id(), title: "Welcome to Amplify", body: "Explore campaigns or create one to help a message travel further.", type: "info", createdAt: now() }
];

const campaignSchema = z.object({
  title: z.string().trim().min(3).max(60),
  category: z.string().min(1),
  creatorName: z.string().trim().min(2).max(100),
  summary: z.string().max(300).optional().default(""),
  coverImage: z.string().url().optional().or(z.literal("")).default(""),
  storyIntro: z.string().max(2000).optional().default(""),
  storySections: z.array(z.object({ heading: z.string().max(120), body: z.string().max(4000) })).optional().default([]),
  sources: z.array(z.object({ title: z.string().max(200), url: z.string().url() })).optional().default([]),
  adHeadline: z.string().max(60).optional().default(""),
  adDescription: z.string().max(180).optional().default(""),
  cta: z.string().max(40).optional().default("Learn more"),
  audienceLocation: z.string().max(120).optional().default("India"),
  audienceInterests: z.array(z.string()).optional().default([]),
  channels: z.array(z.string()).optional().default(["Social feeds"]),
  durationDays: z.number().int().min(1).max(90).optional().default(14),
  fundingGoal: z.number().min(1000).max(10000000).optional().default(10000),
  adBudget: z.number().min(0).optional().default(0),
  status: z.string().optional()
});

function listMemory(query = {}) {
  let rows = [...memoryCampaigns];
  if (query.q) {
    const q = String(query.q).toLowerCase();
    rows = rows.filter(c => [c.title, c.summary, c.category, c.creatorName].some(v => String(v || "").toLowerCase().includes(q)));
  }
  if (query.category && query.category !== "All") rows = rows.filter(c => c.category === query.category);
  if (query.status) rows = rows.filter(c => c.status === query.status);
  if (query.sort === "ending") rows.sort((a,b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
  else if (query.sort === "progress") rows.sort((a,b) => (b.raised/b.fundingGoal) - (a.raised/a.fundingGoal));
  else rows.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  return rows;
}

app.get("/health", (req,res) => res.json({ ok: true, mode: useDb ? "postgres" : "demo-memory", time: now() }));

app.get("/api/campaigns", async (req,res,next) => {
  try {
    if (useDb) {
      const result = await pool.query("SELECT * FROM campaigns ORDER BY created_at DESC");
      let rows = result.rows.map(dbToCampaign);
      if (req.query.q) { const q = String(req.query.q).toLowerCase(); rows = rows.filter(c => [c.title,c.summary,c.category,c.creatorName].some(v => String(v||"").toLowerCase().includes(q))); }
      if (req.query.category && req.query.category !== "All") rows = rows.filter(c => c.category === req.query.category);
      if (req.query.status) rows = rows.filter(c => c.status === req.query.status);
      if (req.query.sort === "ending") rows.sort((a,b)=>new Date(a.deadline||0)-new Date(b.deadline||0));
      if (req.query.sort === "progress") rows.sort((a,b)=>(b.raised/b.fundingGoal)-(a.raised/a.fundingGoal));
      return res.json({ campaigns: rows });
    }
    return res.json({ campaigns: listMemory(req.query) });
  } catch(e) { next(e); }
});

function dbToCampaign(r) {
  return { id:r.id, title:r.title, category:r.category, creatorName:r.creator_name, summary:r.summary || "", coverImage:r.cover_image || "", storyIntro:r.story_intro || "", storySections:r.story_sections || [], sources:r.sources || [], adHeadline:r.ad_headline || "", adDescription:r.ad_description || "", cta:r.cta || "Learn more", audienceLocation:r.audience_location || "India", audienceInterests:r.audience_interests || [], channels:r.channels || [], durationDays:r.duration_days || 14, fundingGoal:Number(r.funding_goal), raised:Number(r.raised), status:r.status, createdAt:r.created_at, estimatedReach:Number(r.estimated_reach || 0), adBudget:Number(r.ad_budget || 0), adSpend:Number(r.ad_spend || 0), impressions:Number(r.impressions || 0), clicks:Number(r.clicks || 0), measuredReach:r.measured_reach == null ? null : Number(r.measured_reach), backers:Number(r.backers || 0), deadline:r.deadline };
}
async function getCampaign(campaignId) {
  if (useDb) { const r = await pool.query("SELECT * FROM campaigns WHERE id=$1", [campaignId]); return r.rowCount ? dbToCampaign(r.rows[0]) : null; }
  return memoryCampaigns.find(c => c.id === campaignId) || null;
}
app.get("/api/campaigns/:id", async (req,res,next) => {
  try { const c = await getCampaign(req.params.id); if (!c) return res.status(404).json({ error:"Campaign not found" }); res.json({ campaign:c }); }
  catch(e) { next(e); }
});

app.post("/api/campaigns", async (req,res,next) => {
  try {
    const parsed = campaignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error:"Please check the campaign fields.", details:parsed.error.flatten() });
    const p = parsed.data;
    const campaign = { ...p, id:id(), raised:0, status:"draft", createdAt:now(), estimatedReach:Math.round((p.adBudget || p.fundingGoal*0.9)*REACH_PER_RUPEE), adSpend:0, impressions:0, clicks:0, measuredReach:null, backers:0, deadline:new Date(Date.now()+p.durationDays*86400000).toISOString() };
    if (useDb) {
      await pool.query(`INSERT INTO campaigns (id,title,category,creator_name,summary,cover_image,story_intro,story_sections,sources,ad_headline,ad_description,cta,audience_location,audience_interests,channels,duration_days,funding_goal,raised,status,estimated_reach,ad_budget,deadline)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,0,'draft',$18,$19,$20)`,
      [campaign.id,p.title,p.category,p.creatorName,p.summary,p.coverImage,p.storyIntro,JSON.stringify(p.storySections),JSON.stringify(p.sources),p.adHeadline,p.adDescription,p.cta,p.audienceLocation,p.audienceInterests,p.channels,p.durationDays,p.fundingGoal,campaign.estimatedReach,p.adBudget,campaign.deadline]);
    } else memoryCampaigns.unshift(campaign);
    res.status(201).json({ campaign });
  } catch(e) { next(e); }
});

app.put("/api/campaigns/:id", async (req,res,next) => {
  try {
    const existing = await getCampaign(req.params.id);
    if (!existing) return res.status(404).json({ error:"Draft not found" });
    if (!["draft","changes_requested"].includes(existing.status)) return res.status(409).json({ error:"Only drafts or campaigns returned for changes can be edited." });
    const parsed = campaignSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error:"Invalid campaign fields", details:parsed.error.flatten() });
    const updated = { ...existing, ...parsed.data, id:existing.id, status:existing.status, estimatedReach:Math.round((parsed.data.adBudget ?? existing.adBudget ?? existing.fundingGoal*0.9)*REACH_PER_RUPEE) };
    if (useDb) {
      const p=updated;
      await pool.query(`UPDATE campaigns SET title=$2,category=$3,creator_name=$4,summary=$5,cover_image=$6,story_intro=$7,story_sections=$8,sources=$9,ad_headline=$10,ad_description=$11,cta=$12,audience_location=$13,audience_interests=$14,channels=$15,duration_days=$16,funding_goal=$17,estimated_reach=$18,ad_budget=$19 WHERE id=$1`,
      [p.id,p.title,p.category,p.creatorName,p.summary,p.coverImage, p.storyIntro,JSON.stringify(p.storySections),JSON.stringify(p.sources),p.adHeadline,p.adDescription,p.cta,p.audienceLocation,p.audienceInterests,p.channels,p.durationDays,p.fundingGoal,p.estimatedReach,p.adBudget]);
    } else memoryCampaigns = memoryCampaigns.map(c => c.id === updated.id ? updated : c);
    res.json({ campaign:updated });
  } catch(e) { next(e); }
});

app.post("/api/campaigns/:id/submit", async (req,res,next) => {
  try {
    const c = await getCampaign(req.params.id);
    if (!c) return res.status(404).json({ error:"Campaign not found" });
    if (!["draft","changes_requested"].includes(c.status)) return res.status(409).json({ error:"This campaign cannot be submitted in its current state." });
    const missing = [];
    if (!c.title || !c.category || !c.creatorName) missing.push("Basics");
    if (!c.storyIntro || c.storyIntro.trim().length < 20) missing.push("Story");
    if (!c.sources || !c.sources.length) missing.push("At least one supporting source");
    if (!c.adHeadline) missing.push("Ad headline");
    if (!c.audienceLocation) missing.push("Target location");
    if (!c.fundingGoal || c.fundingGoal < 1000) missing.push("Funding goal (minimum ₹1,000)");
    if (req.body.rulesAccepted !== true) missing.push("Campaign rules confirmation");
    if (missing.length) return res.status(400).json({ error:"Complete the required submission checks.", missing });
    c.status = "submitted_for_review";
    c.submittedAt = now();
    const activity = { id:id(), title:"Campaign submitted for review", body:`“${c.title}” is in the review queue. It will not be promoted until approval and distribution setup are complete.`, type:"review", campaignId:c.id, createdAt:now() };
    memoryActivity.unshift(activity);
    if (useDb) await pool.query("UPDATE campaigns SET status='submitted_for_review', submitted_at=NOW() WHERE id=$1",[c.id]);
    else memoryCampaigns = memoryCampaigns.map(x=>x.id===c.id?c:x);
    res.json({ campaign:c, activity });
  } catch(e) { next(e); }
});

app.post("/api/campaigns/:id/contributions", async (req,res,next) => {
  try {
    const c = await getCampaign(req.params.id);
    if (!c) return res.status(404).json({ error:"Campaign not found" });
    if (c.status !== "available_for_funding") return res.status(409).json({ error:"This campaign is not currently available for funding." });
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount < 50 || amount > 100000) return res.status(400).json({ error:"Contribution must be between ₹50 and ₹1,00,000." });
    if (req.body.simulate !== "success") return res.status(402).json({ error:"Simulated payment was not successful.", paymentStatus:req.body.simulate || "failed" });
    const platformFee = Math.round(amount*PLATFORM_FEE_RATE*100)/100;
    const transactionFee = Math.round(amount*TRANSACTION_FEE_RATE*100)/100;
    const total = Math.round((amount+platformFee+transactionFee)*100)/100;
    const receipt = { id:"rcpt_"+crypto.randomBytes(5).toString("hex").toUpperCase(), campaignId:c.id, campaignTitle:c.title, amount, platformFee, transactionFee, total, estimatedReach:Math.round(amount*REACH_PER_RUPEE), status:"simulated_success", privateBacker:true, createdAt:now() };
    if (useDb) {
      await pool.query("INSERT INTO contributions (id,campaign_id,user_id,amount,platform_fee,transaction_fee,total,payment_status,private_backer,receipt_code) VALUES ($1,$2,$3,$4,$5,$6,$7,'simulated_success',true,$8)",[id(),c.id,demoUser.id,amount,platformFee,transactionFee,total,receipt.id]);
      const result=await pool.query("UPDATE campaigns SET raised=raised+$2, backers=backers+1 WHERE id=$1 RETURNING *",[c.id,amount]);
      Object.assign(c,dbToCampaign(result.rows[0]));
    } else {
      c.raised += amount; c.backers += 1;
      memoryCampaigns = memoryCampaigns.map(x=>x.id===c.id?c:x);
      memoryContributions.unshift(receipt);
    }
    memoryActivity.unshift({ id:id(), title:"Contribution confirmed", body:`Your ₹${amount.toLocaleString("en-IN")} contribution supports message distribution for “${c.title}”.`, type:"payment", campaignId:c.id, createdAt:now() });
    res.status(201).json({ receipt, campaign:c, message:"Simulated payment successful. No real money was collected." });
  } catch(e) { next(e); }
});

app.get("/api/campaigns/:id/report", async (req,res,next) => {
  try {
    const c=await getCampaign(req.params.id); if(!c) return res.status(404).json({error:"Campaign not found"});
    res.json({ report:{ campaignId:c.id,title:c.title,status:c.status,fundsRaised:c.raised,fundingGoal:c.fundingGoal,adBudgetAllocated:c.adBudget || Math.max(0,c.raised),adSpend:c.adSpend || 0,impressions:c.impressions || 0,clicks:c.clicks || 0,estimatedReach:c.estimatedReach || Math.round((c.adBudget||0)*REACH_PER_RUPEE),measuredReach:c.measuredReach,campaignDurationDays:c.durationDays,metricsNote:"Reach is a model estimate until delivery data is connected. No live ad platform is connected in this prototype."} });
  } catch(e) { next(e); }
});

app.get("/api/activity", (req,res) => res.json({ activity:memoryActivity }));
app.get("/api/profile", async (req,res,next) => {
  try {
    const campaigns=useDb?(await pool.query("SELECT * FROM campaigns ORDER BY created_at DESC")).rows.map(dbToCampaign):memoryCampaigns;
    const contributions=useDb?(await pool.query("SELECT id,campaign_id,amount,total,payment_status,receipt_code,created_at FROM contributions WHERE user_id=$1 ORDER BY created_at DESC",[demoUser.id])).rows:memoryContributions;
    res.json({ user:demoUser, createdCampaigns:campaigns.filter(c=>c.creatorName===demoUser.name || c.status==="draft" || c.status==="submitted_for_review"), backedCampaigns:contributions, counts:{created:campaigns.filter(c=>c.creatorName===demoUser.name).length,backed:contributions.length} });
  } catch(e) { next(e); }
});

app.post("/api/review/:id", async (req,res,next) => {
  try {
    const actionSchema=z.object({action:z.enum(["approve","changes","reject"]),note:z.string().max(500).optional().default("")});
    const parsed=actionSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({error:"Action must be approve, changes or reject."});
    const c=await getCampaign(req.params.id); if(!c) return res.status(404).json({error:"Campaign not found"});
    if(c.status!=="submitted_for_review") return res.status(409).json({error:"Only submitted campaigns can be reviewed."});
    c.status=parsed.data.action==="approve"?"available_for_funding":parsed.data.action==="changes"?"changes_requested":"rejected";
    c.reviewNote=parsed.data.note;
    if(useDb) await pool.query("UPDATE campaigns SET status=$2,review_note=$3,reviewed_at=NOW() WHERE id=$1",[c.id,c.status,c.reviewNote]);
    else memoryCampaigns=memoryCampaigns.map(x=>x.id===c.id?c:x);
    memoryActivity.unshift({id:id(),title:parsed.data.action==="approve"?"Campaign approved":parsed.data.action==="changes"?"Changes requested":"Campaign rejected",body:`“${c.title}”: ${parsed.data.note || c.status}.`,type:"review",campaignId:c.id,createdAt:now()});
    res.json({campaign:c, message:"Review action saved. Approval makes the campaign available for funding only; it does not launch advertising."});
  } catch(e) { next(e); }
});

app.use((err,req,res,next)=> {
  console.error(err);
  res.status(500).json({error:"Unexpected server error. Please try again."});
});

app.listen(PORT,()=>console.log(`Amplify API listening on http://localhost:${PORT} (${useDb?"PostgreSQL":"demo-memory"} mode)`));
