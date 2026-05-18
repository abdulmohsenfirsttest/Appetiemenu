export type GhabashiTask = { key: string; name: string; desc: string }

export const GHABASHI_TASKS: Record<'morning' | 'closing', GhabashiTask[]> = {
  morning: [
    { key: 'grill_morning',  name: 'Clean the grill',        desc: 'Scrub and clean the grill surface before service' },
    { key: 'kitchen_walls',  name: 'Clean kitchen walls',    desc: 'Wipe down all wall surfaces inside the kitchen' },
    { key: 'floor_morning',  name: 'Mop the floor',          desc: 'Mop and sanitize the kitchen floor' },
    { key: 'prep_tables',    name: 'Clean prep tables',      desc: 'Sanitize all food preparation surfaces' },
    { key: 'storage_check',  name: 'Check storage/pantry',   desc: 'Organize and check stock in storage area' },
    { key: 'stations_setup', name: 'Set up work stations',   desc: 'Prepare all stations and equipment for service' },
  ],
  closing: [
    { key: 'grill_closing',  name: 'Clean the grill',           desc: 'Deep clean grill after service ends' },
    { key: 'walls_closing',  name: 'Clean kitchen walls',       desc: 'Wipe down all wall surfaces inside the kitchen' },
    { key: 'floor_closing',  name: 'Mop the floor',             desc: 'Mop and sanitize the kitchen floor' },
    { key: 'fryers',         name: 'Clean the fryers',          desc: 'Clean and drain all fryers after service' },
    { key: 'hood',           name: 'Clean hood/ventilation',    desc: 'Wipe down the ventilation hood above cooking area' },
    { key: 'food_storage',   name: 'Store food properly',       desc: 'Store remaining food in containers and refrigerate' },
    { key: 'trash',          name: 'Empty trash bins',          desc: 'Empty all bins, clean them and replace liners' },
  ],
}
