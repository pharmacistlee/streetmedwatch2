'use strict';
// Seed reports carried over from the design prototype so the site has real-looking
// content on first run. Fields: [id, date, substance, brand, amount, takenWith,
// symptoms(|-separated), duration, help, outcome, state, note]

const RAW = [
  ['R-2481','2026-07-21','Tianeptine','Za Za Red','most of a bottle','Nothing','Vomiting|Racing heart|Confusion','6-12 hours','Emergency room','Hospitalized','OH',"Bought it at the counter like it was an energy shot. Two hours later I could not stop throwing up and my heart was going so fast I thought I was dying."],
  ['R-2479','2026-07-20','7-OH','7-OH Extra Strength tablets','two tablets','Nothing','Vomiting|Sweating|Severe withdrawal','1-3 days','None','Ongoing','TX','Started as one tablet after work. Three weeks in I was sick every morning until I took one. Quitting felt like the flu times ten.'],
  ['R-2476','2026-07-19','Nitrous oxide','Galaxy Gas','a full canister over a night','Alcohol','Numbness/tingling|Trouble walking|Confusion','More than a week','Urgent care','Ongoing','GA','My hands and feet went numb and never fully came back. Doctor said B12 and nerve damage.'],
  ['R-2470','2026-07-17','Tianeptine','Neptune Elixir','one bottle','Prescription SSRI','Racing heart|Panic/anxiety|Tremors','6-12 hours','Poison Control','Recovered','AL','Called poison control at 3am. They stayed on the phone with me until my heart slowed down.'],
  ['R-2466','2026-07-15','Phenibut','bulk powder online','unknown, eyeballed','Alcohol','Blackout|Confusion|Fainting','12-24 hours','Emergency room','Hospitalized','FL','Woke up in the ER with no memory of the night. My roommate found me unresponsive on the kitchen floor.'],
  ['R-2461','2026-07-13','Delta-8 THC','gas station gummies','two gummies','Nothing','Panic/anxiety|Racing heart|Hallucinations','6-12 hours','Emergency room','Recovered','NC','Package said mellow. I had the worst panic attack of my life and was convinced I was having a stroke.'],
  ['R-2458','2026-07-11','7-OH','shot bottle at smoke shop','one bottle','Kratom tea','Vomiting|Racing heart|Sweating','3-6 hours','None','Recovered','TN','Nobody at the shop said this was different from regular kratom. It is not the same thing.'],
  ['R-2452','2026-07-08','Tianeptine','Za Za Silver','several capsules over a day','Nothing','Severe withdrawal|Insomnia|Tremors','More than a week','Urgent care','Ongoing','MS','I am not using to feel good anymore. I am using so I can get out of bed.'],
  ['R-2447','2026-07-05','Amanita gummies','Amanita Dream cubes','one cube','Nothing','Confusion|Nausea|Hallucinations','6-12 hours','Poison Control','Recovered','CA','Sold next to the CBD like candy. I lost four hours and could not tell what was real.'],
  ['R-2441','2026-07-02','Nitrous oxide','Galaxy Gas','a night of use','Delta-8','Fainting|Numbness/tingling|Chest pain','1-3 days','Emergency room','Recovered','GA','Passed out and hit my head on the counter. Stitches and a very long talk with a neurologist.'],
  ['R-2436','2026-06-28','Tianeptine','Tianna Red','two bottles','Alcohol','Trouble breathing|Blackout|Confusion','6-12 hours','Emergency room','Hospitalized','KY','My girlfriend gave me Narcan before the ambulance got there. The ER doctor said that is probably why I am here.'],
  ['R-2430','2026-06-25','Phenibut','capsules from a vape shop','daily for a month','Nothing','Severe withdrawal|Panic/anxiety|Insomnia','More than a week','Emergency room','Recovered','WA','Stopping cold turkey put me in the hospital. I did not know that could happen from something sold at a shop.'],
  ['R-2425','2026-06-22','7-OH','7-OH tablets','three tablets','Nothing','Vomiting|Sweating|Racing heart','3-6 hours','Poison Control','Recovered','TX','Threw up for six hours straight. Poison control was calm and did not make me feel like a criminal.'],
  ['R-2419','2026-06-19','Delta-8 THC','vape cart, smoke shop','a few pulls','Nothing','Racing heart|Panic/anxiety|Chest pain','1-3 hours','Urgent care','Recovered','NY','19 years old, no drug history, ended up in urgent care thinking my heart was failing.'],
  ['R-2413','2026-06-15','Tianeptine','Za Za Red','one bottle','Prescription benzodiazepine','Trouble breathing|Confusion|Fainting','3-6 hours','Emergency room','Hospitalized','OH','I did not know it worked like an opioid. Combining it with my anxiety medication nearly killed me.'],
  ['R-2408','2026-06-11','Kava','kava bar drink','several shells','Alcohol','Nausea|Trouble walking|Numbness/tingling','3-6 hours','None','Recovered','FL','Mostly fine but the numbness and how hard it hit with alcohol surprised me.'],
  ['R-2402','2026-06-07','7-OH','extract shot','one shot daily','Nothing','Severe withdrawal|Insomnia|Sweating','More than a week','None','Ongoing','AZ','Two weeks of daily use and I am physically dependent. That happened much faster than I expected.'],
  ['R-2396','2026-06-03','Nitrous oxide','whippet chargers','a box','Nothing','Numbness/tingling|Confusion|Fainting','1-3 days','Urgent care','Ongoing','IL','Tingling in my legs that has not gone away in a month.'],
  ['R-2390','2026-05-29','Tianeptine','Neptune Elixir','unknown','Nothing','Racing heart|Vomiting|Panic/anxiety','6-12 hours','Poison Control','Recovered','LA','Bought it because a coworker said it helped his mood. Ended up shaking on the bathroom floor.'],
  ['R-2384','2026-05-24','Phenibut','powder','a heaped scoop','Alcohol','Blackout|Vomiting|Confusion','12-24 hours','Emergency room','Recovered','CO','Measuring powder by eye is how people end up in the ER. I am one of them.'],
  ['R-2377','2026-05-19','Amanita gummies','Shroom Boom gummies','two gummies','Nothing','Nausea|Confusion|Tremors','6-12 hours','None','Recovered','MI','Very unpleasant and much stronger than the package suggested.'],
  ['R-2371','2026-05-14','7-OH','7-OH Extra Strength tablets','two tablets','Alcohol','Vomiting|Fainting|Racing heart','3-6 hours','Emergency room','Recovered','TX','Fainted in a parking lot. Somebody called an ambulance for me.'],
  ['R-2364','2026-05-09','Delta-8 THC','edible from gas station','one package','Nothing','Hallucinations|Panic/anxiety|Vomiting','12-24 hours','Emergency room','Recovered','NC','The whole bag was one serving apparently. Twelve hours of hell.'],
  ['R-2358','2026-05-03','Tianeptine','Za Za Silver','several bottles a day','Nothing','Severe withdrawal|Sweating|Insomnia','More than a week','Urgent care','Ongoing','AL','Spending 60 dollars a day at the gas station to not be sick.'],
  ['R-2351','2026-04-27','Nitrous oxide','Galaxy Gas','multiple canisters','Nothing','Numbness/tingling|Trouble walking','More than a week','Urgent care','Ongoing','GA','I am 22 and I walk with a cane right now. Nerve damage from B12 depletion.'],
  ['R-2344','2026-04-20','Phenibut','capsules','daily','Nothing','Severe withdrawal|Tremors|Panic/anxiety','More than a week','Poison Control','Recovered','WA','Tapering with a doctor worked. Trying alone did not.'],
  ['R-2337','2026-04-12','Tianeptine','Tianna Red','one bottle','Nothing','Vomiting|Racing heart','3-6 hours','None','Recovered','TN','Never again. It felt like being poisoned.'],
  ['R-2329','2026-04-04','7-OH','shot bottle','two bottles','Nothing','Vomiting|Confusion|Sweating','6-12 hours','Poison Control','Recovered','OK','The shop clerk recommended it for pain. I had no idea what it was.'],
  ['R-2320','2026-03-26','Delta-8 THC','gummies','half a package','Nothing','Racing heart|Panic/anxiety','3-6 hours','None','Recovered','PA','Anxiety for two days afterwards.'],
  ['R-2311','2026-03-15','Tianeptine','Za Za Red','unknown','Alcohol','Blackout|Trouble breathing','6-12 hours','Emergency room','Hospitalized','OH','My brother found me. I do not remember any of it.'],
  ['R-2301','2026-03-02','Kava','kava extract capsules','two capsules','Prescription medication','Nausea|Confusion','3-6 hours','None','Recovered','OR','Interacted with my medication in a way nobody warned me about.'],
  ['R-2288','2026-02-14','Phenibut','powder online','unknown','Nothing','Fainting|Confusion|Insomnia','12-24 hours','Emergency room','Recovered','CO','Ordered it like it was a supplement. It is not a supplement.'],
  ['R-2272','2026-01-28','Tianeptine','Neptune Elixir','two bottles','Nothing','Racing heart|Vomiting|Tremors','6-12 hours','Emergency room','Hospitalized','FL','Second ER visit in a month for the same product.'],
  ['R-2255','2026-01-09','Nitrous oxide','whippet chargers','unknown','Alcohol','Fainting|Numbness/tingling','1-3 days','None','Recovered','IL','Woke up on the floor of a party with no idea how long I had been out.'],
  ['R-2231','2025-12-12','7-OH','7-OH tablets','one tablet','Nothing','Nausea|Sweating','1-3 hours','None','Recovered','TX','Sick for an afternoon from a single tablet.'],
  ['R-2210','2025-11-20','Tianeptine','Za Za Red','one bottle','Nothing','Panic/anxiety|Racing heart','3-6 hours','Poison Control','Recovered','MS','Poison control talked me through it. No judgment at all.'],
  ['R-2186','2025-10-30','Delta-8 THC','vape cart','a few pulls','Nothing','Panic/anxiety|Chest pain','1-3 hours','Urgent care','Recovered','NY','Kids are buying these at the corner store.'],
  ['R-2160','2025-10-02','Phenibut','capsules','daily for weeks','Nothing','Severe withdrawal|Insomnia','More than a week','Urgent care','Recovered','WA','The withdrawal is the part nobody tells you about.'],
  ['R-2131','2025-09-08','Tianeptine','Za Za Silver','several capsules','Nothing','Vomiting|Confusion','6-12 hours','None','Recovered','KY','Marketed as a mood supplement on the shelf by the register.'],
  ['R-2104','2025-08-16','Amanita gummies','Amanita Dream cubes','two cubes','Alcohol','Confusion|Nausea|Hallucinations','6-12 hours','Poison Control','Recovered','CA','Bought as a legal alternative. Very disorienting and frightening.'],
];

function toRecord(t) {
  return {
    id: t[0],
    incidentDate: t[1],
    filedAt: t[1] + 'T12:00:00.000Z',
    reporter: 'The person it happened to',
    substance: t[2],
    brand: t[3],
    amount: t[4],
    takenWith: t[5],
    symptoms: t[6].split('|'),
    duration: t[7],
    help: t[8],
    outcome: t[9],
    state: t[10],
    note: t[11],
    status: 'published',
  };
}

module.exports = { RAW, SEED_RECORDS: RAW.map(toRecord) };
