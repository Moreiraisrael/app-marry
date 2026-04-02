require('dotenv').config();
const fs = require('fs');

async function getAuth() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const json = await res.json();
    if (json && json.definitions && json.definitions.partner_stores) {
       fs.writeFileSync('schema.json', JSON.stringify(json.definitions.partner_stores, null, 2));
       console.log('Success - wrote to schema.json');
    } else {
       console.log('Definitions or partner_stores not found', Object.keys(json.definitions || {}));
    }
  } catch(e) {
    console.error(e);
  }
}
getAuth();
