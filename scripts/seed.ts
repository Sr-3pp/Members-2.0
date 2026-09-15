import { bundledCountries } from "../server/utils/countries";
/**
 * Seeds the MongoDB database with sample members, enterprises and programs.
 *
 * Usage:
 *   pnpm db:seed           # upsert seed records (safe to re-run)
 *   pnpm db:seed --fresh   # wipe the three collections first
 *
 * Records are matched by a natural key (member email, enterprise folio,
 * program title), so running the script twice never duplicates data.
 * The connection string is read from MONGODB_URI, falling back to `.env`.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose, { type QueryFilter, type Model, type Types } from "mongoose";

import MemberModel from "../server/models/Member";
import EnterpriseModel from "../server/models/Enterprise";
import ProgramModel from "../server/models/Program";
import { categoryDefinitions, memberCategorySlugs, type MemberCategory } from "../shared/utils/categories";
import { resolveFormCountry } from "../utils/forms";
import { flagUrl } from "../shared/utils/countries";
import type {
  CreateEnterpriseInput,
  CreateMemberInput,
  MemberRange,
  ProgramStatus,
  Skill,
} from "../shared/types/entities";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FRESH = process.argv.includes("--fresh");

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

// Countries resolve through the same helper the profile forms use, so the
// stored name, flag and zone match what the app itself would persist.
type CountryCode = "mx" | "us" | "ar" | "es";

/**
 * Enterprise and program pictures reuse files uploaded through the app, which
 * live in the git-ignored `public/uploads/members` folder, and fall back to the
 * bundled category artwork on a clean checkout.
 */
const UPLOADS_DIR = join(ROOT, "public/uploads/members");
const uploadedPictures = existsSync(UPLOADS_DIR)
  ? readdirSync(UPLOADS_DIR)
      .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
      .sort()
      .map((file) => `/uploads/members/${file}`)
  : [];

function pictureFor(index: number, fallback: string) {
  if (!uploadedPictures.length) return fallback;
  return uploadedPictures[index % uploadedPictures.length];
}

/**
 * Members use real portrait photos from the Random User Generator set
 * (https://randomuser.me), which is free to use for mockups. Remote URLs
 * outside the configured image domains are rendered by NuxtImg untouched,
 * the same way country flags already are.
 */
function portrait(gender: "men" | "women", id: number) {
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
}

function social(handle: string, website?: string) {
  return {
    website: website ?? `https://${handle}.example.com`,
    fb: `/${handle}`,
    tw: `/${handle}`,
    in: `/in/${handle}`,
  };
}

function skills(...entries: Array<[string, number]>): Skill[] {
  return entries.map(([name, level]) => ({ name, level }));
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

interface MemberSeed {
  folio: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile?: string;
  range: MemberRange;
  categories: MemberCategory[];
  country: CountryCode;
  city: string;
  nationality: string;
  languages: string[];
  education: string;
  resume: string;
  skills: Skill[];
  handle: string;
  picture: string;
}

// Every member belongs to two categories, so each of the four categories ends
// up with six members.
const MEMBERS: MemberSeed[] = [
  {
    folio: "100001",
    name: "María Fernanda",
    last_name: "López Hernández",
    email: "maria.lopez@example.com",
    phone: "5555010101",
    mobile: "5215510101010",
    range: "experto",
    categories: ["consultor", "coach"],
    country: "mx",
    city: "Ciudad de México",
    nationality: "Mexicana",
    languages: ["es", "en"],
    education: "Maestría en Desarrollo Organizacional, Universidad Iberoamericana.",
    resume:
      "Consultora y coach ejecutiva con 15 años acompañando a equipos directivos en procesos de transformación cultural.",
    skills: skills(["Coaching ejecutivo", 9], ["Gestión del cambio", 8], ["Facilitación", 8]),
    handle: "mflopez",
    picture: portrait("women", 44),
  },
  {
    folio: "100002",
    name: "Carlos Alberto",
    last_name: "Ramírez Soto",
    email: "carlos.ramirez@example.com",
    phone: "3333020202",
    range: "profesional",
    categories: ["capacitador", "certificaciones-especiales"],
    country: "mx",
    city: "Guadalajara",
    nationality: "Mexicana",
    languages: ["es"],
    education: "Licenciatura en Pedagogía, Universidad de Guadalajara.",
    resume:
      "Capacitador certificado en metodologías de aprendizaje experiencial para la industria manufacturera.",
    skills: skills(["Diseño instruccional", 9], ["Aprendizaje experiencial", 8], ["Evaluación", 7]),
    handle: "caramirez",
    picture: portrait("men", 32),
  },
  {
    folio: "100003",
    name: "Ana Lucía",
    last_name: "Torres Vega",
    email: "ana.torres@example.com",
    phone: "1144030303",
    mobile: "5491144030303",
    range: "especialista",
    categories: ["coach", "capacitador"],
    country: "ar",
    city: "Buenos Aires",
    nationality: "Argentina",
    languages: ["es", "pt"],
    education: "Certificación Internacional en Coaching Ontológico.",
    resume:
      "Coach ontológica y formadora de formadores, especializada en programas de liderazgo para mandos medios.",
    skills: skills(["Coaching ontológico", 9], ["Liderazgo", 8], ["Oratoria", 7]),
    handle: "altorres",
    picture: portrait("women", 65),
  },
  {
    folio: "100004",
    name: "Diego",
    last_name: "Martínez Ruiz",
    email: "diego.martinez@example.com",
    phone: "910040404",
    range: "profesional",
    categories: ["consultor", "certificaciones-especiales"],
    country: "es",
    city: "Madrid",
    nationality: "Española",
    languages: ["es", "en", "fr"],
    education: "MBA, IE Business School.",
    resume:
      "Consultor en estrategia y certificador de sistemas de gestión de calidad para pymes europeas.",
    skills: skills(["Estrategia", 9], ["ISO 9001", 9], ["Análisis financiero", 7]),
    handle: "dmartinez",
    picture: portrait("men", 75),
  },
  {
    folio: "100005",
    name: "Valentina",
    last_name: "Gómez Ortiz",
    email: "valentina.gomez@example.com",
    phone: "7135050505",
    range: "afiliado",
    categories: ["coach", "consultor"],
    country: "us",
    city: "Houston",
    nationality: "Colombiana",
    languages: ["es", "en"],
    education: "Bachelor of Science in Psychology, University of Houston.",
    resume:
      "Coach de carrera para profesionales hispanohablantes en Estados Unidos y consultora en bienestar laboral.",
    skills: skills(["Coaching de carrera", 7], ["Bienestar laboral", 7], ["Comunicación", 8]),
    handle: "vgomez",
    picture: portrait("women", 12),
  },
  {
    folio: "100006",
    name: "Javier Eduardo",
    last_name: "Castillo Mendoza",
    email: "javier.castillo@example.com",
    phone: "8181060606",
    mobile: "5218181060606",
    range: "experto",
    categories: ["capacitador", "consultor"],
    country: "mx",
    city: "Monterrey",
    nationality: "Mexicana",
    languages: ["es", "en"],
    education: "Ingeniería Industrial, Tecnológico de Monterrey.",
    resume:
      "Consultor en mejora continua y capacitador en Lean Six Sigma para plantas del norte de México.",
    skills: skills(["Lean Six Sigma", 9], ["Mejora continua", 9], ["Gestión de proyectos", 8]),
    handle: "jecastillo",
    picture: portrait("men", 41),
  },
  {
    folio: "100007",
    name: "Lucía",
    last_name: "Fernández Navarro",
    email: "lucia.fernandez@example.com",
    phone: "930070707",
    range: "especialista",
    categories: ["certificaciones-especiales", "coach"],
    country: "es",
    city: "Barcelona",
    nationality: "Española",
    languages: ["es", "en", "de"],
    education: "Máster en Recursos Humanos, Universitat de Barcelona.",
    resume:
      "Coach de equipos certificada y evaluadora de competencias directivas para procesos de selección.",
    skills: skills(["Coaching de equipos", 8], ["Evaluación de competencias", 9], ["Selección", 7]),
    handle: "lfernandez",
    picture: portrait("women", 26),
  },
  {
    folio: "100008",
    name: "Sebastián",
    last_name: "Herrera Díaz",
    email: "sebastian.herrera@example.com",
    phone: "3514080808",
    range: "afiliado",
    categories: ["capacitador", "certificaciones-especiales"],
    country: "ar",
    city: "Córdoba",
    nationality: "Argentina",
    languages: ["es"],
    education: "Licenciatura en Ciencias de la Educación, Universidad Nacional de Córdoba.",
    resume:
      "Capacitador en habilidades blandas y certificador de programas de formación dual en el sector agroindustrial.",
    skills: skills(["Habilidades blandas", 8], ["Formación dual", 7], ["Tutoría", 7]),
    handle: "sherrera",
    picture: portrait("men", 18),
  },
  {
    folio: "100009",
    name: "Camila",
    last_name: "Rodríguez Paz",
    email: "camila.rodriguez@example.com",
    phone: "3055090909",
    mobile: "13055090909",
    range: "profesional",
    categories: ["consultor", "coach"],
    country: "us",
    city: "Miami",
    nationality: "Venezolana",
    languages: ["es", "en", "pt"],
    education: "Master in Organizational Leadership, Florida International University.",
    resume:
      "Consultora en cultura organizacional y coach de alta dirección para empresas latinoamericanas con sede en Miami.",
    skills: skills(["Cultura organizacional", 9], ["Coaching directivo", 8], ["Negociación", 8]),
    handle: "crodriguez",
    picture: portrait("women", 57),
  },
  {
    folio: "100010",
    name: "Andrés Felipe",
    last_name: "Morales Ríos",
    email: "andres.morales@example.com",
    phone: "2222101010",
    range: "especialista",
    categories: ["certificaciones-especiales", "capacitador"],
    country: "mx",
    city: "Puebla",
    nationality: "Colombiana",
    languages: ["es", "en"],
    education: "Maestría en Educación, Benemérita Universidad Autónoma de Puebla.",
    resume:
      "Especialista en certificación de competencias laborales y capacitador en normas técnicas de competencia.",
    skills: skills(["Competencias laborales", 9], ["Normas CONOCER", 8], ["Capacitación", 8]),
    handle: "afmorales",
    picture: portrait("men", 60),
  },
  {
    folio: "100011",
    name: "Isabel Cristina",
    last_name: "Vargas Luna",
    email: "isabel.vargas@example.com",
    phone: "960111111",
    range: "experto",
    categories: ["coach", "capacitador"],
    country: "es",
    city: "Valencia",
    nationality: "Española",
    languages: ["es", "en"],
    education: "Doctorado en Psicología del Trabajo, Universitat de València.",
    resume:
      "Coach y formadora en inteligencia emocional aplicada al liderazgo, con experiencia en el sector sanitario.",
    skills: skills(["Inteligencia emocional", 9], ["Liderazgo", 8], ["Formación", 9]),
    handle: "icvargas",
    picture: portrait("women", 33),
  },
  {
    folio: "100012",
    name: "Rodrigo",
    last_name: "Silva Campos",
    email: "rodrigo.silva@example.com",
    phone: "3414121212",
    range: "afiliado",
    categories: ["consultor", "certificaciones-especiales"],
    country: "ar",
    city: "Rosario",
    nationality: "Argentina",
    languages: ["es", "pt"],
    education: "Contador Público, Universidad Nacional de Rosario.",
    resume:
      "Consultor en gestión para cooperativas y certificador de buenas prácticas en economía social.",
    skills: skills(["Gestión cooperativa", 8], ["Buenas prácticas", 7], ["Finanzas", 7]),
    handle: "rsilva",
    picture: portrait("men", 86),
  },
];

// ---------------------------------------------------------------------------
// Enterprises
// ---------------------------------------------------------------------------

interface EnterpriseSeed {
  folio: string;
  name: string;
  phone: string;
  country: CountryCode;
  city: string;
  languages: string[];
  description: string;
  resume: string;
  skills: Skill[];
  handle: string;
}

const ENTERPRISES: EnterpriseSeed[] = [
  {
    folio: "200001",
    name: "Consultoría Estratégica Norte",
    phone: "8181200001",
    country: "mx",
    city: "Monterrey",
    languages: ["es", "en"],
    description: "Firma de consultoría en estrategia y operaciones para la industria del norte de México.",
    resume: "Más de 20 años acompañando a empresas manufactureras en proyectos de mejora continua.",
    skills: skills(["Estrategia", 9], ["Operaciones", 8], ["Lean", 8]),
    handle: "cenorte",
  },
  {
    folio: "200002",
    name: "Talento Global Coaching",
    phone: "5125200002",
    country: "us",
    city: "Austin",
    languages: ["en", "es"],
    description: "Escuela de coaching con programas bilingües para líderes en Estados Unidos y Latinoamérica.",
    resume: "Certificamos coaches ejecutivos bajo estándares internacionales desde 2010.",
    skills: skills(["Coaching ejecutivo", 9], ["Liderazgo", 9], ["Mentoría", 8]),
    handle: "talentoglobal",
  },
  {
    folio: "200003",
    name: "Instituto Latinoamericano de Capacitación",
    phone: "1144200003",
    country: "ar",
    city: "Buenos Aires",
    languages: ["es", "pt"],
    description: "Instituto dedicado a la formación de formadores y al diseño de programas de capacitación corporativa.",
    resume: "Presencia en Argentina, Uruguay y Brasil con más de 5,000 egresados.",
    skills: skills(["Diseño instruccional", 9], ["E-learning", 8], ["Evaluación", 8]),
    handle: "ilcap",
  },
  {
    folio: "200004",
    name: "Iberia Certifica",
    phone: "910200004",
    country: "es",
    city: "Madrid",
    languages: ["es", "en", "fr"],
    description: "Entidad certificadora de competencias profesionales y sistemas de gestión en Europa.",
    resume: "Acreditada para certificar normas ISO y competencias directivas en la Unión Europea.",
    skills: skills(["ISO 9001", 9], ["ISO 45001", 8], ["Auditoría", 9]),
    handle: "iberiacertifica",
  },
  {
    folio: "200005",
    name: "Desarrollo Humano Integral",
    phone: "5555200005",
    country: "mx",
    city: "Ciudad de México",
    languages: ["es"],
    description: "Consultora especializada en cultura organizacional, bienestar laboral y desarrollo de equipos.",
    resume: "Hemos implementado programas de bienestar en más de 100 organizaciones mexicanas.",
    skills: skills(["Cultura organizacional", 9], ["Bienestar", 8], ["Desarrollo de equipos", 8]),
    handle: "dhintegral",
  },
  {
    folio: "200006",
    name: "Andes Learning Group",
    phone: "2614200006",
    country: "ar",
    city: "Mendoza",
    languages: ["es", "en"],
    description: "Grupo educativo enfocado en mentoría y desarrollo profesional para jóvenes talentos.",
    resume: "Programas de mentoría con alianzas universitarias en la región andina.",
    skills: skills(["Mentoría", 9], ["Desarrollo profesional", 8], ["Empleabilidad", 7]),
    handle: "andeslearning",
  },
];

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

interface ProgramSeed {
  title: string;
  length: number;
  enterprise: string; // enterprise folio
  participants: string[]; // member emails
  description: string;
  skills: Skill[];
  status: ProgramStatus;
}

const PROGRAMS: ProgramSeed[] = [
  {
    title: "Certificación en Coaching Ejecutivo",
    length: 90,
    enterprise: "200002",
    participants: ["maria.lopez@example.com", "ana.torres@example.com", "valentina.gomez@example.com", "camila.rodriguez@example.com"],
    description: "Programa intensivo para certificar coaches ejecutivos con práctica supervisada y evaluación final.",
    skills: skills(["Coaching ejecutivo", 9], ["Escucha activa", 8], ["Feedback", 8]),
    status: "active",
  },
  {
    title: "Diplomado en Consultoría Organizacional",
    length: 120,
    enterprise: "200001",
    participants: ["maria.lopez@example.com", "diego.martinez@example.com", "javier.castillo@example.com", "rodrigo.silva@example.com"],
    description: "Diplomado orientado a consultores que buscan estructurar diagnósticos e intervenciones organizacionales.",
    skills: skills(["Diagnóstico organizacional", 9], ["Gestión del cambio", 8], ["Presentación ejecutiva", 7]),
    status: "active",
  },
  {
    title: "Formación de Formadores",
    length: 45,
    enterprise: "200003",
    participants: ["carlos.ramirez@example.com", "ana.torres@example.com", "sebastian.herrera@example.com", "isabel.vargas@example.com"],
    description: "Taller para capacitadores que desean dominar el diseño instruccional y la facilitación de grupos.",
    skills: skills(["Diseño instruccional", 9], ["Facilitación", 8], ["Evaluación del aprendizaje", 8]),
    status: "active",
  },
  {
    title: "Certificación Internacional en Gestión del Cambio",
    length: 60,
    enterprise: "200004",
    participants: ["diego.martinez@example.com", "lucia.fernandez@example.com", "andres.morales@example.com"],
    description: "Certificación avalada en Europa para profesionales que lideran procesos de transformación.",
    skills: skills(["Gestión del cambio", 9], ["Comunicación", 8], ["Análisis de impacto", 7]),
    status: "active",
  },
  {
    title: "Liderazgo y Desarrollo de Equipos",
    length: 30,
    enterprise: "200005",
    participants: ["valentina.gomez@example.com", "javier.castillo@example.com", "camila.rodriguez@example.com", "isabel.vargas@example.com"],
    description: "Programa corto para fortalecer el liderazgo de mandos medios y la cohesión de sus equipos.",
    skills: skills(["Liderazgo", 8], ["Trabajo en equipo", 8], ["Resolución de conflictos", 7]),
    status: "active",
  },
  {
    title: "Programa de Mentoría para Nuevos Afiliados",
    length: 180,
    enterprise: "200006",
    participants: ["valentina.gomez@example.com", "sebastian.herrera@example.com", "rodrigo.silva@example.com"],
    description: "Acompañamiento semestral en el que miembros expertos guían a los afiliados recién incorporados.",
    skills: skills(["Mentoría", 9], ["Planeación de carrera", 7], ["Networking", 7]),
    status: "active",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Inserts or updates a document by its natural key and returns its id. */
async function upsert<T>(
  model: Model<T>,
  filter: QueryFilter<T>,
  data: Record<string, unknown>,
): Promise<{ id: Types.ObjectId; created: boolean }> {
  const result = await model.updateOne(filter, { $set: data }, { upsert: true });
  if (result.upsertedId) return { id: result.upsertedId as Types.ObjectId, created: true };

  const existing = await model.findOne(filter).select("_id").lean<{ _id: Types.ObjectId }>();
  if (!existing) throw new Error(`Failed to upsert document for ${JSON.stringify(filter)}`);
  return { id: existing._id, created: false };
}

function report(label: string, created: number, updated: number) {
  console.log(`  ${label.padEnd(12)} ${created} created, ${updated} updated`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.MONGODB_URI) {
    try {
      process.loadEnvFile(join(ROOT, ".env"));
    } catch {
      // No .env file; rely on the environment.
    }
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Define it in .env or the environment.");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to ${mongoose.connection.name}`);

  if (FRESH) {
    console.log("Removing existing members, enterprises and programs (--fresh)...");
    await Promise.all([
      MemberModel.deleteMany({}),
      EnterpriseModel.deleteMany({}),
      ProgramModel.deleteMany({}),
    ]);
  }

  console.log(
    uploadedPictures.length
      ? `Using ${uploadedPictures.length} uploaded picture(s) from public/uploads/members`
      : "No uploaded pictures found; using bundled category artwork",
  );

  // Members
  const memberIds = new Map<string, Types.ObjectId>();
  let created = 0;
  let updated = 0;
  for (const seed of MEMBERS) {
    const { handle, country, ...rest } = seed;
    const data: CreateMemberInput = {
      ...rest,
      mobile: rest.mobile ?? "",
      social: social(handle),
      country: resolveFormCountry(country, bundledCountries),
      status: "active",
    };
    const result = await upsert(MemberModel, { email: seed.email }, data);
    memberIds.set(seed.email, result.id);
    if (result.created) created++;
    else updated++;
  }
  report("Members", created, updated);

  // Enterprises
  const enterpriseIds = new Map<string, Types.ObjectId>();
  created = 0;
  updated = 0;
  for (const [index, seed] of ENTERPRISES.entries()) {
    const { handle, country, ...rest } = seed;
    const data: CreateEnterpriseInput = {
      ...rest,
      nationality: "",
      picture: pictureFor(index + MEMBERS.length, categoryDefinitions.enterprise.image),
      social: social(handle),
      country: resolveFormCountry(country, bundledCountries),
      status: "active",
    };
    const result = await upsert(EnterpriseModel, { folio: seed.folio }, data);
    enterpriseIds.set(seed.folio, result.id);
    if (result.created) created++;
    else updated++;
  }
  report("Enterprises", created, updated);

  // Programs
  created = 0;
  updated = 0;
  for (const [index, seed] of PROGRAMS.entries()) {
    const enterprise = enterpriseIds.get(seed.enterprise);
    if (!enterprise) throw new Error(`Unknown enterprise folio ${seed.enterprise} for "${seed.title}"`);

    const participants = seed.participants.map((email) => {
      const id = memberIds.get(email);
      if (!id) throw new Error(`Unknown participant ${email} for "${seed.title}"`);
      return id;
    });

    const data = {
      title: seed.title,
      length: seed.length,
      description: seed.description,
      skills: seed.skills,
      status: seed.status,
      enterprise,
      participants,
      photo: pictureFor(index + MEMBERS.length + ENTERPRISES.length, categoryDefinitions.programs.image),
    };
    const result = await upsert(ProgramModel, { title: seed.title }, data);
    if (result.created) created++;
    else updated++;
  }
  report("Programs", created, updated);

  // Records created before flags were cached point straight at the provider;
  // route them through the app so they are fetched once and reused.
  for (const model of [MemberModel, EnterpriseModel] as Model<unknown>[]) {
    const legacy = await model.find({ "country.flag": /^https?:\/\// }).select("country.code").lean<
      Array<{ _id: Types.ObjectId; country?: { code?: string } }>
    >();
    for (const doc of legacy) {
      if (!doc.country?.code) continue;
      await model.updateOne({ _id: doc._id }, { $set: { "country.flag": flagUrl(doc.country.code) } });
    }
    if (legacy.length) console.log(`  Rewrote ${legacy.length} legacy flag URL(s) in ${model.modelName}`);
  }

  // Summary
  console.log("\nDatabase totals:");
  const [members, enterprises, programs] = await Promise.all([
    MemberModel.countDocuments(),
    EnterpriseModel.countDocuments(),
    ProgramModel.countDocuments(),
  ]);
  console.log(`  members: ${members}, enterprises: ${enterprises}, programs: ${programs}`);

  console.log("\nMembers per category:");
  for (const category of memberCategorySlugs) {
    const count = await MemberModel.countDocuments({ categories: category });
    console.log(`  ${category.padEnd(28)} ${count}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
