'use strict';
// Static reference data. Mirrors the front-end design so the form, filters and
// substance pages stay in sync. Served to the client via GET /api/meta.

// Substance -> common street/brand names shown on substance pages.
const SOLD_AS = {
  'Tianeptine': 'Za Za · Tianna · Neptune · "gas station heroin"',
  '7-OH': '7-hydroxymitragynine · 7-OH tablets · kratom extract',
  'Phenibut': 'F-Phenibut · "calm" capsules · bulk powder',
  'Nitrous oxide': 'Galaxy Gas · whippets · chargers · "nangs"',
  'Delta-8 THC': 'D8 · hemp gummies · legal weed',
  'Amanita gummies': 'Amanita muscaria · "legal mushroom" gummies',
  'Kava': 'kava bar drinks · kava extract capsules',
};

// Brand / street name -> substance it contains. Reports are grouped by this pairing.
const BRANDS = [
  ['Za Za Red', 'Tianeptine'], ['Za Za Silver', 'Tianeptine'], ['Tianna Red', 'Tianeptine'],
  ['Neptune Elixir', 'Tianeptine'], ['Pegasus / Tianna Green', 'Tianeptine'],
  ['7-OH Extra Strength tablets', '7-OH'], ['7-OH tablets', '7-OH'], ['7-OH shot bottle', '7-OH'],
  ['Kratom extract shot', '7-OH'], ['Kratom extract tablets', '7-OH'], ['Gas-station kratom shot', '7-OH'],
  ['“Seven” / 7-hydroxy tablets', '7-OH'],
  ['Galaxy Gas', 'Nitrous oxide'], ['Whippet chargers', 'Nitrous oxide'],
  ['Phenibut capsules', 'Phenibut'], ['Phenibut bulk powder', 'Phenibut'], ['F-Phenibut', 'Phenibut'],
  ['Delta-8 gummies', 'Delta-8 THC'], ['Delta-8 vape cart', 'Delta-8 THC'], ['Delta-8 edible', 'Delta-8 THC'],
  ['Amanita Dream cubes', 'Amanita gummies'], ['Shroom Boom gummies', 'Amanita gummies'],
  ['Kava bar drink', 'Kava'], ['Kava extract capsules', 'Kava'],
];

const SUBSTANCES = Object.keys(SOLD_AS);

const STATES = ['Alabama', 'Arizona', 'California', 'Colorado', 'Florida', 'Georgia', 'Illinois',
  'Kentucky', 'Louisiana', 'Michigan', 'Mississippi', 'New York', 'North Carolina', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Tennessee', 'Texas', 'Washington'];

const ST_ABBR = {
  Alabama: 'AL', Arizona: 'AZ', California: 'CA', Colorado: 'CO', Florida: 'FL', Georgia: 'GA',
  Illinois: 'IL', Kentucky: 'KY', Louisiana: 'LA', Michigan: 'MI', Mississippi: 'MS',
  'New York': 'NY', 'North Carolina': 'NC', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
  Pennsylvania: 'PA', Tennessee: 'TN', Texas: 'TX', Washington: 'WA',
};

const SYMPTOM_CHOICES = ['Racing heart', 'Vomiting', 'Nausea', 'Blackout', 'Confusion',
  'Panic/anxiety', 'Trouble breathing', 'Chest pain', 'Fainting', 'Numbness/tingling',
  'Tremors', 'Sweating', 'Insomnia', 'Hallucinations', 'Severe withdrawal', 'Trouble walking', 'Seizure'];

const DURATION_OPTIONS = ['Under an hour', '1-3 hours', '3-6 hours', '6-12 hours', '12-24 hours',
  '1-3 days', 'More than a week'];

const HELP_OPTIONS = ['None', 'Poison Control', 'Urgent care', 'Emergency room'];
const OUTCOME_OPTIONS = ['Recovered', 'Ongoing', 'Hospitalized'];
const REPORTER_CHOICES = ['The person it happened to', 'Parent or caregiver',
  'Healthcare provider', 'Friend or bystander'];

// Words that route a submission to human review instead of auto-publishing.
const FLAGGED = ['kill myself', 'end it', 'suicid', 'hurt myself', 'overdose on purpose',
  'how much to', 'enough to die', 'self harm'];

module.exports = {
  SOLD_AS, BRANDS, SUBSTANCES, STATES, ST_ABBR, SYMPTOM_CHOICES,
  DURATION_OPTIONS, HELP_OPTIONS, OUTCOME_OPTIONS, REPORTER_CHOICES, FLAGGED,
};
